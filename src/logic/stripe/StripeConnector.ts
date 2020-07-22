import { IPaymentsConnector } from "../IPaymentsConnector";
import { PaymentV1, OrderV1, PaymentStatusV1 } from "../../data/version1";
import { CredentialParams, CredentialResolver } from "pip-services3-components-node";
import { ConfigParams, BadRequestException, IdGenerator } from "pip-services3-commons-node";

import Stripe from 'stripe';
import { isString } from "util";

import { StripeOptions } from './StripeOptions';
import { PaymentSystemAccountV1 } from "../../data/version1/PaymentSystemAccountV1";
import { BuyerV1 } from "../../data/version1/BuyerV1";
import { PaymentMethodV1 } from "../../data/version1/PaymentMethodV1";
import { PaymentSystemV1 } from "../../data/version1/PaymentSystemV1";
import { SellerV1 } from "../../data/version1/SellerV1";
import { PayoutV1 } from "../../data/version1/PayoutV1";
import { PayoutStatusV1 } from "../../data/version1/PayoutStatusV1";

export class StripeConnector implements IPaymentsConnector {

    private _credentialsResolver: CredentialResolver = new CredentialResolver();

    private _credentials: CredentialParams;
    private _stripeOptions: StripeOptions;
    private _autoConfirm: boolean = true;

    constructor() {
    }

    configure(config: ConfigParams): void {
        this._credentialsResolver.configure(config);
        this._stripeOptions = new StripeOptions(config);

        this._autoConfirm = config.getAsBooleanWithDefault("options.auto_confirm", this._autoConfirm);
    }

    isOpen(): boolean {
        return true;
    }

    open(correlationId: string, callback?: (err: any) => void): void {
        let error: any;

        this._credentialsResolver.lookup(correlationId, (err, result) => {
            if (err != null) {
                error = err;
                return;
            }

            this._credentials = result;
        });

        if (callback) callback(error);
    }

    close(correlationId: string, callback?: (err: any) => void): void {
        if (callback) callback(null);
    }

    async makePaymentAsync(correlationId: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1,
        amount: number, currencyCode: string): Promise<PaymentV1> {

        let payment = await this.submitPaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode);
        return await this.authorizePaymentAsync(correlationId, account, payment);
    }

    async submitPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1,
        amount: number, currencyCode: string): Promise<PaymentV1> {

        if (!paymentMethod || !paymentMethod.id)
            throw new Error('Payment method id required');

        let client = this.createPaymentSystemClient(correlationId, account);

        let customerId = await this.fromPublicCustomerAsync(client, buyer.id);
        if (!customerId)
            throw new Error('Buyer id required');

        order = order ?? { total: amount, currency_code: currencyCode, id: IdGenerator.nextLong() };

        let payment: PaymentV1 = new PaymentV1();
        payment.id = IdGenerator.nextLong();
        payment.system = PaymentSystemV1.Stripe;

        var intent = await client.paymentIntents.create({
            amount: Math.trunc(order.total * 100),
            currency: order.currency_code,
            customer: customerId,
            payment_method: paymentMethod.id,
            metadata: {
                'payment_id': payment.id
            }
        });

        payment.order_id = intent.id;
        payment.confirm_data = intent.client_secret;
        payment.status = PaymentStatusV1.Unconfirmed;
        payment.status_details = intent.status;

        return payment;
    }

    async authorizePaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1> {
        if (payment.status == PaymentStatusV1.Confirmed)
            throw new Error('Payment has already been authorized');

        let client = this.createPaymentSystemClient(correlationId, account);

        var intent_id = payment.order_id;
        var intent = await client.paymentIntents.confirm(intent_id);

        if (intent.status != 'succeeded')
            throw new Error('Cant authorize payment: ' + intent.status);

        payment.capture_id = payment.order_id;
        payment.status = PaymentStatusV1.Confirmed;

        return payment;
    }

    async checkPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1> {
        if (!payment.order_id) return null;

        let client = this.createPaymentSystemClient(correlationId, account);

        var intent_id = payment.order_id;
        var intent = await client.paymentIntents.retrieve(intent_id);

        let payment_id = intent.metadata['payment_id'];

        if (!payment_id || payment.id != payment_id)
            throw new Error('Invalid payment id');

        payment.status = this.toPublicStatus(intent.status);
        payment.status_details = intent.status;
        payment.confirm_data = intent.client_secret;

        return payment;
    }

    async refundPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1> {
        if (payment.status != PaymentStatusV1.Confirmed)
            throw new Error('Payment is not confirmed');

        if (!payment.capture_id)
            throw new Error('Payment does not contain an identifier of intent');

        let client = this.createPaymentSystemClient(correlationId, account);

        let intent = await client.paymentIntents.retrieve(payment.capture_id);
        if (intent) {
            if (intent.status.startsWith('requires_'))
            {
                intent = await client.paymentIntents.cancel(payment.capture_id);

                payment.status = PaymentStatusV1.Canceled;
                payment.status_details = 'cancel ' + intent.status;
            }
            else if (intent.status == 'succeeded')
            {
                let refund = await client.refunds.create({
                    payment_intent: payment.capture_id
                });

                payment.status = PaymentStatusV1.Canceled;
                payment.status_details = 'refund ' + refund.status;
            }
        }

        return payment;
    }

    async makePayoutAsync(correlationId: string, account: PaymentSystemAccountV1,
        seller: SellerV1, description: string, amount: number, currencyCode: string): Promise<PayoutV1> {
        let client = this.createPaymentSystemClient(correlationId, account);

        let sellerAcc: Stripe.Account = await this.findSellerAccount(client, seller.id);
        if (!sellerAcc) {
            sellerAcc = await this.createSellerAccount(client, seller, null);
        }

        var transfer = await client.transfers.create({
            amount: amount,
            currency: currencyCode,
            destination: sellerAcc.id,
            description: description,
        });

        var payout: PayoutV1 = {
            id: IdGenerator.nextLong(),
            system: PaymentSystemV1.Stripe,
            status: PayoutStatusV1.Confirmed,
            transfer_id: transfer.id,
            account_id: sellerAcc.id
        };

        return payout;
    }

    async checkPayoutAsync(correlationId: string, account: PaymentSystemAccountV1,
        payout: PayoutV1): Promise<PayoutV1> {

        if (!payout.transfer_id)
            throw new BadRequestException(correlationId, 'ERR_PAYOUT', 'Transfer id not specified')
                .withDetails('payout', payout);

        let client = this.createPaymentSystemClient(correlationId, account);
        let transfer = await client.transfers.retrieve(payout.transfer_id, {
            expand: ['reversals']
        });

        payout.account_id = isString(transfer.destination) ? transfer.destination : transfer.destination.id;
        payout.reversal_id = transfer.reversed && transfer.reversals.data.length > 0 ? transfer.reversals.data[0].id : null;
        payout.status = transfer.reversed ? PayoutStatusV1.Canceled : PayoutStatusV1.Confirmed;

        return payout;
    }

    async cancelPayoutAsync(correlationId: string, account: PaymentSystemAccountV1,
        payout: PayoutV1): Promise<PayoutV1> {
        let client = this.createPaymentSystemClient(correlationId, account);

        let reversal = client.transfers.createReversal(payout.transfer_id, {
            refund_application_fee: true
        })

        if (reversal != null) {
            payout.status = PayoutStatusV1.Canceled;
            return payout;
        }

        return payout;
    }

    private toPublicStatus(status: string): string {
        switch (status) {
            case 'requires_payment_method': return PaymentStatusV1.Created;
            case 'requires_confirmation': return PaymentStatusV1.Unconfirmed;
            case 'requires_action': return PaymentStatusV1.Unconfirmed;
            case 'processing': return PaymentStatusV1.Unconfirmed;
            case 'requires_capture': return PaymentStatusV1.Unconfirmed;
            case 'canceled': return PaymentStatusV1.Canceled;
            case 'succeeded': return PaymentStatusV1.Confirmed;
        }
    }

    private async fromPublicCustomerAsync(client: Stripe, customer_id: string): Promise<string> {
        if (customer_id) {
            var customers = await client.customers.list({});

            for (let index = 0; index < customers.data.length; index++) {
                const customer = customers.data[index];
                if (customer.metadata['customer_id'] == customer_id) {
                    return customer.id;
                }
            }
        }

        return null;
    }

    private createPaymentSystemClient(correlationId: string, account: PaymentSystemAccountV1) {
        let secretKey: string;

        if (account) {
            secretKey = account.access_key;
        }
        else if (this._credentials) {
            secretKey = this._credentials.getAccessKey();
        }
        else
            throw new BadRequestException(correlationId, 'ERR_CREDENTIALS', 'Credentials to connect to the payment system is not specified')

        let client = new Stripe(secretKey, {
            apiVersion: this._stripeOptions.apiVersion,
            maxNetworkRetries: this._stripeOptions.maxNetworkRetries,
            httpAgent: this._stripeOptions.httpAgent,
            timeout: this._stripeOptions.timeout,
            host: this._stripeOptions.host,
            port: this._stripeOptions.port,
            protocol: this._stripeOptions.protocol,
            telemetry: this._stripeOptions.telemetry
        });

        return client;
    }

    private async createSellerAccount(client: Stripe, seller: SellerV1, paymentMethod: any): Promise<Stripe.Account> {
        return await client.accounts.create({
            email: seller.email,
            country: seller.address.country_code,
            type: 'custom',
            business_type: 'individual',
            individual: {
                address: {
                    city: seller.address.city,
                    country: seller.address.country_code,
                    line1: seller.address.line1,
                    line2: seller.address.line2,
                    postal_code: seller.address.postal_code,
                    state: seller.address.state
                },
                email: seller.email,
                first_name: seller.first_name,
                last_name: seller.last_name,
                phone: seller.phone,
                ssn_last_4: seller.ssn_last4,
                dob: {
                    day: seller.birth_date.getUTCDate(),
                    month: seller.birth_date.getUTCMonth(),
                    year: seller.birth_date.getUTCFullYear()
                }
            },
            business_profile: {
                mcc: '1520',
                url: 'http://unknown.com/'
            },
            external_account: 'tok_visa_debit_us_transferSuccess',
            requested_capabilities: [
                //'card_payments',
                'transfers',
            ],
            tos_acceptance: {
                ip: seller.ip_address,
                date: Math.floor(Date.now() / 1000),
            },
            //external_account: 
            metadata: {
                seller_id: seller.id
            },
        });
    }

    private async findSellerAccount(client: Stripe, seller_id: string): Promise<Stripe.Account> {
        let starting_after: string;
        let page: Stripe.ApiList<Stripe.Account>;

        do {
            let params: Stripe.AccountListParams = {
                limit: 100,
            };

            if (starting_after) params.starting_after = starting_after;

            page = await client.accounts.list({
                limit: 100,
                starting_after: starting_after
            });

            let account = page.data.find(x => x.metadata['seller_id'] == seller_id);
            if (account) return account;
        }
        while (page.has_more);

        return null;
    }

}
