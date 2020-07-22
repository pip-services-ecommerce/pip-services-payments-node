let _ = require('lodash');
let async = require('async');

import { CredentialParams } from 'pip-services3-components-node';
import { CredentialResolver } from 'pip-services3-components-node';
import { IPaymentsConnector } from '../IPaymentsConnector';
import { OrderV1, PaymentV1, PaymentStatusV1 } from '../../data/version1';
import { ConfigParams, IdGenerator, BadRequestException } from 'pip-services3-commons-node';
import { PayPalOrder } from './PayPalOrder';
import { PaymentSystemAccountV1 } from '../../data/version1/PaymentSystemAccountV1';
import { BuyerV1 } from '../../data/version1/BuyerV1';
import { PaymentMethodV1 } from '../../data/version1/PaymentMethodV1';
import { PaymentSystemV1 } from '../../data/version1/PaymentSystemV1';
import { SellerV1 } from '../../data/version1/SellerV1';
import { PayoutV1 } from '../../data/version1/PayoutV1';

export class PayPalConnector implements IPaymentsConnector {

    private _credentialsResolver: CredentialResolver = new CredentialResolver();

    private _sandbox: boolean = false;
    private _credentials: CredentialParams;
    private _sdk = require('@paypal/checkout-server-sdk');

    constructor() { }

    configure(config: ConfigParams): void {
        this._credentialsResolver.configure(config);

        // load paypal params from config
        this._sandbox = config.getAsBooleanWithDefault("options.sandbox", this._sandbox);
    }

    public isOpen(): boolean {
        return true;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
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

    public close(correlationId: string, callback: (err: any) => void): void {
        this._credentials = null;
        if (callback) callback(null);
    }

    async makePaymentAsync(correlationId: string, account: PaymentSystemAccountV1,
        buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1,
        amount: number, currencyCode: string) {

        let client = this.createPaymentSystemClient(correlationId, account);

        order = order ?? { total: amount, currency_code: currencyCode, id: IdGenerator.nextLong() };

        let payOrder = this.createPayPalOrder(order);

        const request = new this._sdk.orders.OrdersCreateRequest();
        request.headers["prefer"] = "return=representation";
        request.requestBody(payOrder);

        const response = await client.execute(request);

        if (response.statusCode === 201) {
            let payment: PaymentV1 = new PaymentV1();
            payment.id = IdGenerator.nextLong();
            payment.system = PaymentSystemV1.PayPal;
            payment.status = PaymentStatusV1.Unconfirmed;

            payment.order_id = response.result.id;
            payment.order_amount = order.total;
            payment.order_currency = order.currency_code;
            payment.confirm_data = response.result.links.filter((item: { rel: string; }) => item.rel === "approve")[0].href;
        }

        return null;
    }

    async submitPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1,
        amount: number, currencyCode: string) {
        let client = this.createPaymentSystemClient(correlationId, account);

        order = order ?? { total: amount, currency_code: currencyCode, id: IdGenerator.nextLong() };

        let payOrder = this.createPayPalOrder(order);

        const request = new this._sdk.orders.OrdersCreateRequest();
        request.headers["prefer"] = "return=representation";
        request.requestBody(payOrder);

        const response = await client.execute(request);

        if (response.statusCode === 201) {
            let payment: PaymentV1 = new PaymentV1();
            payment.id = IdGenerator.nextLong();
            payment.system = PaymentSystemV1.PayPal;
            payment.status = PaymentStatusV1.Unconfirmed;

            payment.order_id = response.result.id;
            payment.order_amount = order.total;
            payment.order_currency = order.currency_code;
            payment.confirm_data = response.result.links.filter((item: { rel: string; }) => item.rel === "approve")[0].href;
        }

        return null;
    }

    async authorizePaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1) {
        let client = this.createPaymentSystemClient(correlationId, account);

        let authorizationId = await this.authorizeAsync(client, payment);

        await this.captureAsync(client, payment, authorizationId);

        return payment;
    }

    async checkPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1> {
        let client = this.createPaymentSystemClient(correlationId, account);

        if (payment.order_id) {
            const request = new this._sdk.orders.OrdersGetRequest(payment.order_id);
            const response = await client.execute(request);

            if (response.statusCode === 200) {
                let status = response.result.status;

                payment.status = this.toPublicStatus(status);
                payment.status_details = status;
                payment.order_amount = response.result.purchase_units.amount.value;
                payment.order_currency = response.result.purchase_units.amount.currency_code;;
                payment.confirm_data = response.result.links.filter((item: { rel: string; }) => item.rel === "approve")[0].href;
            }
        }

        return payment;
    }

    makePayoutAsync(correlationId: string, account: PaymentSystemAccountV1, 
        seller: SellerV1, description: string, amount: number, currencyCode: string): Promise<PayoutV1> {
        throw new Error("Method not implemented.");
    }

    checkPayoutAsync(correlationId: string, account: PaymentSystemAccountV1, 
        payout: PayoutV1): Promise<PayoutV1> {
        throw new Error("Method not implemented.");
    }

    cancelPayoutAsync(correlationId: string, account: PaymentSystemAccountV1, 
        payout: PayoutV1): Promise<PayoutV1> {
        throw new Error("Method not implemented.");
    }
 
    private toPublicStatus(status: string): string {
        switch (status) {
            case 'CREATED': return PaymentStatusV1.Created;
            case 'SAVED': return PaymentStatusV1.Unconfirmed;
            case 'APPROVED': return PaymentStatusV1.Authorized;
            case 'VOIDED': return PaymentStatusV1.Canceled;
            case 'COMPLETED': return PaymentStatusV1.Confirmed;
        }
    }

    async refundPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1) {
        let client = this.createPaymentSystemClient(correlationId, account);

        const request = new this._sdk.payments.CapturesRefundRequest(payment.capture_id);
        request.requestBody({
            "amount": {
                "value": payment.order_amount,
                "currency_code": payment.order_currency
            }
        });

        const response = await client.execute(request);

        if (response.statusCode === 201) {
            payment.status = PaymentStatusV1.Canceled;
        }

        return payment;
    }

    private createPaymentSystemClient(correlationId: string, account: PaymentSystemAccountV1) {
        let clientId: string;
        let clientSecret: string;

        if (account) {
            clientId = account.access_id;
            clientSecret = account.access_key;
        }
        else if (this._credentials) {
            clientId = this._credentials.getAccessId();
            clientSecret = this._credentials.getAccessKey();
        }
        else
            throw new BadRequestException(correlationId, 'ERR_CREDENTIALS', 'Credentials to connect to the payment system is not specified')

        let environment = this._sandbox
            ? new this._sdk.core.SandboxEnvironment(clientId, clientSecret)
            : new this._sdk.core.LiveEnvironment(clientId, clientSecret);

        let client = new this._sdk.core.PayPalHttpClient(environment);

        return client;
    }

    private async authorizeAsync(client: any, payment: PaymentV1): Promise<string> {
        const request = new this._sdk.orders.OrdersAuthorizeRequest(payment.order_id);
        request.requestBody({});
        const response = await client.execute(request);

        let authorizationId = "";
        if (response.statusCode === 201) {
            authorizationId = response.result.purchase_units[0].payments.authorizations[0].id;
            payment.status = PaymentStatusV1.Authorized;
        }

        return authorizationId;
    }

    private async captureAsync(client: any, payment: PaymentV1, authId: string): Promise<void> {
        const request = new this._sdk.payments.AuthorizationsCaptureRequest(authId);
        request.requestBody({});

        const response = await client.execute(request);
        if (response.statusCode === 201) {
            payment.capture_id = response.result.id;
            payment.status = PaymentStatusV1.Confirmed;
        }
    }

    private createPayPalOrder(order: OrderV1): PayPalOrder {

        let payOrder: PayPalOrder =
        {
            intent: "AUTHORIZE",
            application_context:
            {
                user_action: 'CONTINUE',
                cancel_url: 'https://www.example.com',
                return_url: 'https://www.example.com'
            },
            purchase_units: [
                {
                    amount: {
                        value: order.total.toString(),
                        currency_code: order.currency_code
                    },
                    items: order.items.map((value, index, array) => {
                        return {
                            name: value.product_name,
                            description: value.description,
                            unit_amount: {
                                value: value.total.toString(),
                                currency_code: order.currency_code
                            },
                            tax: value.discount == null ? null : {
                                value: value.discount.toString(),
                                currency_code: order.currency_code
                            },
                            quantity: value.quantity.toString(),
                            category: null //value.category
                        }
                    })
                }
            ]
        };

        return payOrder;
    }
}