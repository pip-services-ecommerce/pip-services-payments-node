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
exports.PayPalConnector = void 0;
let _ = require('lodash');
let async = require('async');
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const version1_1 = require("../../data/version1");
const version1_2 = require("../../data/version1");
const version1_3 = require("../../data/version1");
class PayPalConnector {
    constructor() {
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._sandbox = false;
        this._sdk = require('@paypal/checkout-server-sdk');
    }
    configure(config) {
        this._credentialsResolver.configure(config);
        // load paypal params from config
        this._sandbox = config.getAsBooleanWithDefault("options.sandbox", this._sandbox);
    }
    isOpen() {
        return true;
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
        if (callback)
            callback(error);
    }
    close(correlationId, callback) {
        this._credentials = null;
        if (callback)
            callback(null);
    }
    makePaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            order = order !== null && order !== void 0 ? order : { total: amount, currency_code: currencyCode, id: pip_services3_commons_node_1.IdGenerator.nextLong() };
            let payOrder = this.createPayPalOrder(order);
            const request = new this._sdk.orders.OrdersCreateRequest();
            request.headers["prefer"] = "return=representation";
            request.requestBody(payOrder);
            const response = yield client.execute(request);
            if (response.statusCode === 201) {
                let payment = new version1_1.PaymentV1();
                payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
                payment.system = version1_3.PaymentSystemV1.PayPal;
                payment.status = version1_2.PaymentStatusV1.Unconfirmed;
                payment.order_id = response.result.id;
                payment.order_amount = order.total;
                payment.order_currency = order.currency_code;
                payment.confirm_data = response.result.links.filter((item) => item.rel === "approve")[0].href;
            }
            return null;
        });
    }
    submitPaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            order = order !== null && order !== void 0 ? order : { total: amount, currency_code: currencyCode, id: pip_services3_commons_node_1.IdGenerator.nextLong() };
            let payOrder = this.createPayPalOrder(order);
            const request = new this._sdk.orders.OrdersCreateRequest();
            request.headers["prefer"] = "return=representation";
            request.requestBody(payOrder);
            const response = yield client.execute(request);
            if (response.statusCode === 201) {
                let payment = new version1_1.PaymentV1();
                payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
                payment.system = version1_3.PaymentSystemV1.PayPal;
                payment.status = version1_2.PaymentStatusV1.Unconfirmed;
                payment.order_id = response.result.id;
                payment.order_amount = order.total;
                payment.order_currency = order.currency_code;
                payment.confirm_data = response.result.links.filter((item) => item.rel === "approve")[0].href;
            }
            return null;
        });
    }
    authorizePaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            let authorizationId = yield this.authorizeAsync(client, payment);
            yield this.captureAsync(client, payment, authorizationId);
            return payment;
        });
    }
    checkPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            if (payment.order_id) {
                const request = new this._sdk.orders.OrdersGetRequest(payment.order_id);
                const response = yield client.execute(request);
                if (response.statusCode === 200) {
                    let status = response.result.status;
                    payment.status = this.toPublicStatus(status);
                    payment.status_details = status;
                    payment.order_amount = response.result.purchase_units.amount.value;
                    payment.order_currency = response.result.purchase_units.amount.currency_code;
                    ;
                    payment.confirm_data = response.result.links.filter((item) => item.rel === "approve")[0].href;
                }
            }
            return payment;
        });
    }
    makePayoutAsync(correlationId, account, seller, description, amount, currencyCode) {
        throw new Error("Method not implemented.");
    }
    checkPayoutAsync(correlationId, account, payout) {
        throw new Error("Method not implemented.");
    }
    cancelPayoutAsync(correlationId, account, payout) {
        throw new Error("Method not implemented.");
    }
    toPublicStatus(status) {
        switch (status) {
            case 'CREATED': return version1_2.PaymentStatusV1.Created;
            case 'SAVED': return version1_2.PaymentStatusV1.Unconfirmed;
            case 'APPROVED': return version1_2.PaymentStatusV1.Authorized;
            case 'VOIDED': return version1_2.PaymentStatusV1.Canceled;
            case 'COMPLETED': return version1_2.PaymentStatusV1.Confirmed;
        }
    }
    refundPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            const request = new this._sdk.payments.CapturesRefundRequest(payment.capture_id);
            request.requestBody({
                "amount": {
                    "value": payment.order_amount,
                    "currency_code": payment.order_currency
                }
            });
            const response = yield client.execute(request);
            if (response.statusCode === 201) {
                payment.status = version1_2.PaymentStatusV1.Canceled;
            }
            return payment;
        });
    }
    createPaymentSystemClient(correlationId, account) {
        let clientId;
        let clientSecret;
        if (account) {
            clientId = account.access_id;
            clientSecret = account.access_key;
        }
        else if (this._credentials) {
            clientId = this._credentials.getAccessId();
            clientSecret = this._credentials.getAccessKey();
        }
        else
            throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_CREDENTIALS', 'Credentials to connect to the payment system is not specified');
        let environment = this._sandbox
            ? new this._sdk.core.SandboxEnvironment(clientId, clientSecret)
            : new this._sdk.core.LiveEnvironment(clientId, clientSecret);
        let client = new this._sdk.core.PayPalHttpClient(environment);
        return client;
    }
    authorizeAsync(client, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new this._sdk.orders.OrdersAuthorizeRequest(payment.order_id);
            request.requestBody({});
            const response = yield client.execute(request);
            let authorizationId = "";
            if (response.statusCode === 201) {
                authorizationId = response.result.purchase_units[0].payments.authorizations[0].id;
                payment.status = version1_2.PaymentStatusV1.Authorized;
            }
            return authorizationId;
        });
    }
    captureAsync(client, payment, authId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new this._sdk.payments.AuthorizationsCaptureRequest(authId);
            request.requestBody({});
            const response = yield client.execute(request);
            if (response.statusCode === 201) {
                payment.capture_id = response.result.id;
                payment.status = version1_2.PaymentStatusV1.Confirmed;
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
                        };
                    })
                }
            ]
        };
        return payOrder;
    }
}
exports.PayPalConnector = PayPalConnector;
//# sourceMappingURL=PayPalConnector.js.map