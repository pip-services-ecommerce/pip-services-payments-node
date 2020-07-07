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
const version1_1 = require("../../data/version1");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const stripe_1 = require("stripe");
class StripePlatform {
    constructor() {
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._client = null;
        this._autoConfirm = true;
    }
    configure(config) {
        this._credentialsResolver.configure(config);
        this._stripeOptions = new StripeOptions(config);
        this._autoConfirm = config.getAsBooleanWithDefault("options.auto_confirm", this._autoConfirm);
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
        let secretKey = this._credentials.getAccessKey();
        this._client = new stripe_1.default(secretKey, {
            apiVersion: this._stripeOptions.apiVersion,
            maxNetworkRetries: this._stripeOptions.maxNetworkRetries,
            httpAgent: this._stripeOptions.httpAgent,
            timeout: this._stripeOptions.timeout,
            host: this._stripeOptions.host,
            port: this._stripeOptions.port,
            protocol: this._stripeOptions.protocol,
            telemetry: this._stripeOptions.telemetry
        });
        if (callback)
            callback(null);
    }
    close(correlationId, callback) {
        this._client = null;
        if (callback)
            callback(null);
    }
    makeCreditPayment(payment, order, callback) {
        this.makeCreditPaymentAsync(payment, order).then(() => {
            if (this._autoConfirm) {
                this.confirmCreditPayment(payment, callback);
                return;
            }
            if (callback)
                callback(null, null);
        }).catch((err) => {
            payment.status = version1_1.PaymentStatusV1.ErrorCreateOrder;
            if (callback)
                callback(err, null);
        });
    }
    confirmCreditPayment(payment, callback) {
        this.confirmCreditPaymentAsync(payment).then(() => {
            if (callback)
                callback(null, null);
        }).catch(err => {
            payment.status = version1_1.PaymentStatusV1.ErrorConfirm;
            if (callback)
                callback(err, null);
        });
    }
    cancelCreditPayment(payment, callback) {
        if (payment.status != version1_1.PaymentStatusV1.Confirmed) {
            callback(new Error('Payment is not confirmed'), null);
            return;
        }
        if (payment.platform_data.capture_id == null) {
            callback(new Error('Payment does not contain an identifier of intent'), null);
            return;
        }
        this._client.paymentIntents.cancel(payment.platform_data.capture_id).then(intent => {
            payment.status = version1_1.PaymentStatusV1.Canceled;
            if (callback)
                callback(null, true);
        }).catch(err => {
            if (callback)
                callback(err, false);
        });
    }
    makeCreditPaymentAsync(payment, order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.method_id == null)
                throw new Error('Payment method id required');
            var intent = yield this._client.paymentIntents.create({
                amount: Math.trunc(order.total * 100),
                currency: order.currency_code,
                metadata: {
                    'payment_id': payment.id
                }
            });
            payment.platform_data.order_id = intent.id;
            payment.platform_data.confirm_data = intent.client_secret;
            payment.status = version1_1.PaymentStatusV1.Unconfirmed;
        });
    }
    confirmCreditPaymentAsync(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.status == version1_1.PaymentStatusV1.Confirmed)
                throw new Error('Payment has already been confirmed');
            var intent_id = payment.platform_data.order_id;
            var intent = yield this._client.paymentIntents.confirm(intent_id);
            if (intent.status == 'succeeded') {
                payment.platform_data.capture_id = payment.platform_data.order_id;
                payment.status = version1_1.PaymentStatusV1.Confirmed;
            }
            else {
                payment.status = version1_1.PaymentStatusV1.ErrorConfirm;
            }
        });
    }
}
exports.StripePlatform = StripePlatform;
class StripeOptions {
    constructor(config) {
        /// The amount of times a request should be retried.
        /// Default: 0
        this.maxNetworkRetries = 0;
        /// The amount of times a request should be retried.
        /// Default: 80000
        this.timeout = 80000;
        /// Host that requests are made to.
        /// Default: 'api.stripe.com'
        this.host = 'api.stripe.com';
        /// Port that requests are made to.
        /// Default: 443
        this.port = 443;
        /// Allow Stripe to send latency telemetry.
        /// Default: true
        this.telemetry = true;
        /// Proxy agent to be used by the library.
        /// Default: null
        this.httpAgent = null;
        //this.apiVersion = config.getAsStringWithDefault("options.apiVersion", this.apiVersion);
        this.maxNetworkRetries = config.getAsIntegerWithDefault("options.maxNetworkRetries", this.maxNetworkRetries);
        this.timeout = config.getAsIntegerWithDefault("options.timeout", this.timeout);
        this.host = config.getAsStringWithDefault("options.host", this.host);
        this.port = config.getAsIntegerWithDefault("options.port", this.port);
        let protocol = config.getAsStringWithDefault("options.protocol", 'https');
        this.protocol = protocol == 'https' ? 'https' : 'http';
        this.telemetry = config.getAsBooleanWithDefault("options.telemetry", this.telemetry);
        let httpAgent = config.getAsStringWithDefault("options.httpAgent", null);
        if (httpAgent != null) {
            {
                const ProxyAgent = require('https-proxy-agent');
                this.httpAgent = new ProxyAgent(this.httpAgent);
            }
        }
    }
}
//# sourceMappingURL=StripePlatform.js.map