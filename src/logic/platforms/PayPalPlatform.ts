let _ = require('lodash');
let async = require('async');

import { CredentialParams, CredentialResolver } from 'pip-services3-components-node';
import { IPaymentPlatform } from './IPaymentPlatform';
import { OrderV1, PaymentV1, PaymentStatusV1 } from '../../data/version1';
import { ConfigParams } from 'pip-services3-commons-node';
import { PayPalOrder } from '.';

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

        if (error != null) {
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

        this.createOrderAsync(payment, order)
            .then(() => callback(null),
                (err) => {
                    payment.status = PaymentStatusV1.ErrorCreateOrder;
                    callback(err)
                }
            )
            .catch((err) => {
                payment.status = PaymentStatusV1.ErrorCreateOrder;
                callback(err)
            });
    }

    public confirmCreditPayment(payment: PaymentV1, callback: (err: any, result: any) => void): void {
        this.authorizeOrderAsync(payment).then(authorizationId => {
            this.captureOrderAsync(payment, authorizationId).catch(error => {
                payment.status = PaymentStatusV1.ErrorConfirm;
                callback(error, null);
            });
        }).catch(error => {
            payment.status = PaymentStatusV1.ErrorAuthorize;
            callback(error, null);
        });
    }

    public cancelCreditPayment(payment: PaymentV1, callback: (err: any) => void): void {
        this.captureRefundAsync(payment)
            .then(() => callback(null))
            .catch(error => callback(error));
    }

    private async createOrderAsync(payment: PaymentV1, order: OrderV1): Promise<void> {
        try {
            let payOrder = this.createPayPalOrder(order);

            const request = new this._checkoutNodeJssdk.orders.OrdersCreateRequest();
            request.headers["prefer"] = "return=representation";
            request.requestBody(payOrder);

            const response = await this._client.execute(request);

            if (response.statusCode === 201) {
                payment.platform_data.order_id = response.result.id;
                payment.platform_data.order_amount = order.total;
                payment.platform_data.order_currency = order.currency_code;    
                payment.platform_data.confirm_data = response.result.links.filter((item: { rel: string; }) => item.rel === "approve")[0].href;
                payment.status = PaymentStatusV1.Unconfirmed;

                console.log("Created Successfully\n");
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }

    private async captureRefundAsync(payment: PaymentV1): Promise<void> {
        const request = new this._checkoutNodeJssdk.payments.CapturesRefundRequest(payment.platform_data.capture_id);
        request.requestBody({
            "amount": {
                "value": payment.platform_data.order_amount,
                "currency_code": payment.platform_data.order_currency
            }
        });

        const response = await this._client.execute(request);
        if (response.statusCode === 201) {
            payment.status = PaymentStatusV1.Canceled;
            return;
        }

        payment.status = PaymentStatusV1.ErrorCancel;
    }

    private async authorizeOrderAsync(payment: PaymentV1): Promise<string> {
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

    private async captureOrderAsync(payment: PaymentV1, authId: string): Promise<void> {
        const request = new this._checkoutNodeJssdk.payments.AuthorizationsCaptureRequest(authId);
        request.requestBody({});
        const response = await this._client.execute(request);
        if (response.statusCode === 201) {
            payment.platform_data.capture_id = response.result.id;
            payment.status = PaymentStatusV1.Confirmed;

            console.log("Captured Successfully\n");
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
                            name: value.name,
                            description: value.description,
                            unit_amount: {
                                value: value.amount.toString(),
                                currency_code: value.amount_currency
                            },
                            tax: value.tax == null ? null : {
                                value: value.tax.toString(),
                                currency_code: value.tax_currency
                            },
                            quantity: value.quantity.toString(),
                            category: value.category
                        }
                    })
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