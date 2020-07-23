import { IPaymentsConnector } from "../IPaymentsConnector";
import { CredentialParams, CredentialResolver } from "pip-services3-components-node";
import { ConfigParams, BadRequestException, IdGenerator } from "pip-services3-commons-node";

import Stripe from 'stripe';
import { isString } from "util";

import { StripeOptions } from './StripeOptions';
import { PaymentSystemAccountV1 } from "../../data/version1/PaymentSystemAccountV1";

import { PaymentV1, PayoutMethodTypeV1 } from "../../data/version1";
import { OrderV1 } from "../../data/version1";
import { PaymentStatusV1 } from "../../data/version1";
import { PayoutMethodV1 } from "../../data/version1";
import { BuyerV1 } from "../../data/version1";
import { PaymentMethodV1 } from "../../data/version1";
import { PaymentSystemV1 } from "../../data/version1";
import { SellerV1 } from "../../data/version1";
import { PayoutV1 } from "../../data/version1";
import { PayoutStatusV1 } from "../../data/version1";

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
            throw new BadRequestException(correlationId, 'ERR_PAYMENT_METHOD_REQUIRED', 'Payment method id required');

        let client = this.createPaymentSystemClient(correlationId, account);

        if (!buyer.id)
            throw new BadRequestException(correlationId, 'ERR_BUYER_REQUIRED', 'Buyer id required').withDetails('buyer', buyer);

        let customer = await this.findItem(p => client.customers.list(p),
            x => x.metadata['customer_id'] == buyer.id, x => x.id);

        if (!customer)
            throw new BadRequestException(correlationId, 'ERR_CUSTOMER_NOT_FOUND', 'Customer is not found by id').withDetails('buyer', buyer);

        order = order ?? { total: amount, currency_code: currencyCode, id: IdGenerator.nextLong() };

        let payment: PaymentV1 = new PaymentV1();
        payment.id = IdGenerator.nextLong();
        payment.system = PaymentSystemV1.Stripe;

        var intent = await client.paymentIntents.create({
            amount: Math.trunc(order.total * 100),
            currency: order.currency_code,
            customer: customer.id,
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
            throw new BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment has already been authorized').withDetails('payment', payment);

        let client = this.createPaymentSystemClient(correlationId, account);

        var intent_id = payment.order_id;
        var intent = await client.paymentIntents.confirm(intent_id);

        if (intent.status != 'succeeded')
            throw new BadRequestException(correlationId, 'ERR_PAYMENT_AUTHORIZE', 'Cant authorize payment').withDetails('intent', intent);

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
            throw new BadRequestException(correlationId, 'ERR_PAYMENT_ID', 'Invalid payment id').withDetails('payment', payment);

        payment.status = this.toPublicStatus(intent.status);
        payment.status_details = intent.status;
        payment.confirm_data = intent.client_secret;

        return payment;
    }

    async refundPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1> {
        if (payment.status != PaymentStatusV1.Confirmed)
            throw new BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment is not confirmed')
                .withDetails('payment', payment);

        if (!payment.capture_id)
            throw new BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment does not contain an identifier of intent (capture_id)')
                .withDetails('payment', payment);

        let client = this.createPaymentSystemClient(correlationId, account);

        let intent = await client.paymentIntents.retrieve(payment.capture_id);
        if (intent) {
            if (intent.status.startsWith('requires_')) {
                intent = await client.paymentIntents.cancel(payment.capture_id);

                payment.status = PaymentStatusV1.Canceled;
                payment.status_details = 'cancel ' + intent.status;
            }
            else if (intent.status == 'succeeded') {
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
        seller: SellerV1, payoutMethod: PayoutMethodV1,
        description: string, amount: number, currencyCode: string): Promise<PayoutV1> {
        let client = this.createPaymentSystemClient(correlationId, account);

        let sellerAcc: Stripe.Account = await this.findItem(p => client.accounts.list(p),
            x => x.metadata['seller_id'] == seller.id, x => x.id);

        if (!sellerAcc) {
            sellerAcc = await this.createSellerAccount(client, seller, payoutMethod);
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

    private async createSellerAccount(client: Stripe, seller: SellerV1, payoutMethod: PayoutMethodV1): Promise<Stripe.Account> {
        let payoutToken = await this.createPayoutToken(client, payoutMethod);

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
            external_account: payoutToken,
            requested_capabilities: [
                //'card_payments',
                'transfers',
            ],
            tos_acceptance: {
                ip: seller.ip_address,
                date: Math.floor(Date.now() / 1000),
            },
            metadata: {
                seller_id: seller.id
            },
        });
    }

    async createPayoutToken(client: Stripe, payoutMethod: PayoutMethodV1): Promise<string> {
        let params: Stripe.TokenCreateParams;

        if (payoutMethod.token) return payoutMethod.token;

        if (payoutMethod.type == PayoutMethodTypeV1.BankAccount) {
            let account = payoutMethod.bank_account;

            params = {
                bank_account: {
                    account_number: account.number,
                    country: account.country,
                    currency: account.currency,
                    account_holder_name: account.first_name + ' ' + account.last_name,
                    account_holder_type: 'individual',
                    routing_number: account.routing_number
                },
            };
        }
        else if (payoutMethod.type == PayoutMethodTypeV1.DebitCard) {
            let card = payoutMethod.card;

            params = {
                card: {
                    //name: card.?
                    //currency: card.?
                    exp_month: card.expire_month.toString(),
                    exp_year: card.expire_year.toString(),
                    number: card.number,
                    cvc: card.ccv,
                    address_city: payoutMethod.billing_address.city,
                    address_country: payoutMethod.billing_address.country_code,
                    address_line1: payoutMethod.billing_address.line1,
                    address_line2: payoutMethod.billing_address.line2,
                    address_state: payoutMethod.billing_address.state,
                    address_zip: payoutMethod.billing_address.postal_code,
                },
            };
        }

        let token = await client.tokens.create(params);
        return token.id;
    }

    private async findItem<T>(list: (params: Stripe.PaginationParams) => Promise<Stripe.ApiList<T>>,
        predicate: (item: T) => boolean,
        getId: (item: T) => string): Promise<T> {
        let page: Stripe.ApiList<T>;

        do {
            let params: Stripe.PaginationParams = {
                limit: 100,
            };

            if (page && page.data.length > 0)
                params.starting_after = getId(page.data[page.data.length - 1]);

            page = await list(params);

            let item = page.data.find(predicate);
            if (item) return item;

        }
        while (page.has_more);

        return null;
    }
}
