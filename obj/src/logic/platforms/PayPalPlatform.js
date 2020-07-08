"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_components_node_1 = require("pip-services3-components-node");
const version1_1 = require("../../data/version1");
class PayPalConnector {
    constructor() {
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._sandbox = false;
        this._client = null;
        this._checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
    }
    configure(config) {
        this._credentialsResolver.configure(config);
        // load paypal params from config
        this._sandbox = config.getAsBooleanWithDefault("options.sandbox", this._sandbox);
    }
    isOpen() {
        return this._client != null;
    }
    open(correlationId, callback) {
        let error;
        this._credentialsResolver.lookup(correlationId, (err, result) => {
            if (err != null) {
                error = err;
                return;
            }
            this._credentials = result;
        });
        if (error != null) {
            if (callback)
                callback(error);
            return;
        }
        let clientId = this._credentials.getAccessId();
        let clientSecret = this._credentials.getAccessKey();
        let environment = this._sandbox
            ? new this._checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
            : new this._checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
        this._client = new this._checkoutNodeJssdk.core.PayPalHttpClient(environment);
        if (callback)
            callback(null);
    }
    close(correlationId, callback) {
        this._client = null;
        if (callback)
            callback(null);
    }
    makeCreditPayment(payment, order, callback) {
        this.createOrderAsync(payment, order)
            .then(() => callback(null), (err) => {
            payment.status = version1_1.PaymentStatusV1.ErrorCreateOrder;
            callback(err);
        })
            .catch((err) => {
            payment.status = version1_1.PaymentStatusV1.ErrorCreateOrder;
            callback(err);
        });
    }
    confirmCreditPayment(payment, callback) {
        this.authorizeOrderAsync(payment).then(authorizationId => {
            this.captureOrderAsync(payment, authorizationId).catch(error => {
                payment.status = version1_1.PaymentStatusV1.ErrorConfirm;
                callback(error, null);
            });
        }).catch(error => {
            payment.status = version1_1.PaymentStatusV1.ErrorAuthorize;
            callback(error, null);
        });
    }
    cancelCreditPayment(payment, callback) {
        this.captureRefundAsync(payment)
            .then(() => callback(null))
            .catch(error => callback(error));
    }
    createOrderAsync(payment, order) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let payOrder = this.createPayPalOrder(order);
                const request = new this._checkoutNodeJssdk.orders.OrdersCreateRequest();
                request.headers["prefer"] = "return=representation";
                request.requestBody(payOrder);
                const response = yield this._client.execute(request);
                if (response.statusCode === 201) {
                    payment.platform_data.order_id = response.result.id;
                    payment.platform_data.order_amount = order.total;
                    payment.platform_data.order_currency = order.currency_code;
                    payment.platform_data.confirm_data = response.result.links.filter((item) => item.rel === "approve")[0].href;
                    payment.status = version1_1.PaymentStatusV1.Unconfirmed;
                    console.log("Created Successfully\n");
                }
            }
            catch (ex) {
                console.error(ex);
            }
        });
    }
    captureRefundAsync(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new this._checkoutNodeJssdk.payments.CapturesRefundRequest(payment.platform_data.capture_id);
            request.requestBody({
                "amount": {
                    "value": payment.platform_data.order_amount,
                    "currency_code": payment.platform_data.order_currency
                }
            });
            const response = yield this._client.execute(request);
            if (response.statusCode === 201) {
                payment.status = version1_1.PaymentStatusV1.Canceled;
                return;
            }
            payment.status = version1_1.PaymentStatusV1.ErrorCancel;
        });
    }
    authorizeOrderAsync(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new this._checkoutNodeJssdk.orders.OrdersAuthorizeRequest(payment.platform_data.order_id);
            request.requestBody({});
            const response = yield this._client.execute(request);
            let authorizationId = "";
            if (response.statusCode === 201) {
                authorizationId = response.result.purchase_units[0].payments.authorizations[0].id;
                payment.status = version1_1.PaymentStatusV1.Authorized;
                console.log("Authorization ID: " + authorizationId);
                console.log("Authorized Successfully\n");
            }
            return authorizationId;
        });
    }
    captureOrderAsync(payment, authId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new this._checkoutNodeJssdk.payments.AuthorizationsCaptureRequest(authId);
            request.requestBody({});
            const response = yield this._client.execute(request);
            if (response.statusCode === 201) {
                payment.platform_data.capture_id = response.result.id;
                payment.status = version1_1.PaymentStatusV1.Confirmed;
                console.log("Captured Successfully\n");
            }
        });
    }
    createPayPalOrder(order) {
        let payOrder = {
            intent: "AUTHORIZE",
            application_context: {
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
                        };
                    })
                }
            ]
        };
        return payOrder;
    }
    fromPublic(value) {
        if (value == null)
            return null;
        delete value.create_time;
        let result = _.omit(value, 'id', 'state');
        return result;
    }
}
exports.PayPalConnector = PayPalConnector;
//# sourceMappingURL=PayPalConnector.js.map