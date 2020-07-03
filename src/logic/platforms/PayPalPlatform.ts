let _ = require('lodash');
let async = require('async');

import { CredentialParams, CredentialResolver } from 'pip-services3-components-node';
import { IPaymentPlatform } from './IPaymentPlatform';
import { OrderV1, PaymentV1, PaymentStatusV1 } from '../../data/version1';
import { ConfigParams } from 'pip-services3-commons-node';

export class PayPalPlatform implements IPaymentPlatform {

    private _credentialsResolver: CredentialResolver = new CredentialResolver();

    private _sandbox: boolean = false;
    private _credentials: CredentialParams;
    private _client: any = null;
    private _checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

    constructor() {
    }

    configure(config: ConfigParams): void {
        this._credentialsResolver.configure(config);

        // load paypal params from config
        this._sandbox = config.getAsBooleanWithDefault("options.sandbox", this._sandbox);
    }

    public isOpen(): boolean {
        return this._client != null;
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

        if (error != null)
        {
            if (callback) callback(error);
            return;
        }

        let clientId = this._credentials.getAccessId();
        let clientSecret = this._credentials.getAccessKey();

        let environment = this._sandbox
            ? new this._checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
            : new this._checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);

        this._client = new this._checkoutNodeJssdk.core.PayPalHttpClient(environment);
        
        if (callback) callback(null);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        this._client = null;
        if (callback) callback(null);
    }

    public makeCreditPayment(payment: PaymentV1, order: OrderV1,
        callback: (err: any) => void): void {

        this.createOrder(payment, order)
            .then(() => callback(null))
            .catch((err) => {
                payment.status = PaymentStatusV1.ErrorCreateOrder;
                callback(err)
            });
    }

    public confirmCreditPayment(payment: PaymentV1, callback: (err: any, result: any) => void): void {
        this.authorizeOrder(payment).then(authorizationId => {
            this.captureOrder(payment, authorizationId).catch(error => {
                payment.status = PaymentStatusV1.ErrorCapture;
                callback(error, null);
            });
        }).catch(error => {
            payment.status = PaymentStatusV1.ErrorAuthorize;
            callback(error, null);
        });
    }

    public cancelCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any) => void): void {
        this.captureRefund(payment, order)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    private async createOrder(payment: PaymentV1, order: OrderV1): Promise<void> {
        let payOrder = this.createPayPalOrder(order);

        const request = new this._checkoutNodeJssdk.orders.OrdersCreateRequest();
        request.headers["prefer"] = "return=representation";
        request.requestBody(payOrder);

        const response = await this._client.execute(request);

        if (response.statusCode === 201) {
            payment.platform_data.order_id = response.result.id;
            payment.platform_data.confirmData = response.result.links.filter((item: { rel: string; }) => item.rel === "approve")[0].href;
            payment.status = PaymentStatusV1.Unconfirmed;

            console.log("Created Successfully\n");
        }
    }

    private async captureRefund(payment: PaymentV1, order: OrderV1): Promise<void> {
        const request = new this._checkoutNodeJssdk.payments.CapturesRefundRequest(payment.platform_data.capture_id);
        request.requestBody({
            "amount": {
                "value": order.amount,
                "currency_code": order.currency_code
            }
        });

        const response = await this._client.execute(request);
        if (response.statusCode === 201) {
            payment.status = PaymentStatusV1.Canceled;
            return;
        }

        payment.status = PaymentStatusV1.ErrorCancel;
    }

    private async authorizeOrder(payment: PaymentV1): Promise<string> {
        const request = new this._checkoutNodeJssdk.orders.OrdersAuthorizeRequest(payment.platform_data.order_id);
        request.requestBody({});
        const response = await this._client.execute(request);

        let authorizationId = "";
        if (response.statusCode === 201) {
            authorizationId = response.result.purchase_units[0].payments.authorizations[0].id;
            payment.status = PaymentStatusV1.Authorized;

            console.log("Authorization ID: " + authorizationId);
            console.log("Authorized Successfully\n");
        }

        return authorizationId;
    }

    private async captureOrder(payment: PaymentV1, authId: string): Promise<void> {
        const request = new this._checkoutNodeJssdk.payments.AuthorizationsCaptureRequest(authId);
        request.requestBody({});
        const response = await this._client.execute(request);
        if (response.statusCode === 201) {
            payment.platform_data.capture_id = response.result.id;
            payment.status = PaymentStatusV1.Captured;

            console.log("Captured Successfully\n");
        }
    }

    private createPayPalOrder(order: OrderV1): PayPalOrder {
        let payOrder: PayPalOrder =
        {
            application_context:
            {
                user_action: 'CONTINUE',
                cancel_url: 'https://www.example.com',
                return_url: 'https://www.example.com'
            },
            purchase_units: [
                {
                    amount: {
                        value: order.amount,
                        currency_code: order.currency_code
                    },
                    items: [
                        // append from order items
                    ]
                }
            ]
        };

        return payOrder;
    }

    private fromPublic(value: PayPalOrder): any {
        if (value == null) return null;

        delete value.create_time;

        let result = _.omit(value, 'id', 'state');

        return result;
    }

}