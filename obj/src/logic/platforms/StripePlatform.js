"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const stripe_1 = require("stripe");
class StripePlatform {
    constructor() {
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._client = null;
    }
    configure(config) {
        this._credentialsResolver.configure(config);
        this._stripeOptions = new StripeOptions(config);
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
        throw new Error("Method not implemented.");
    }
    makeCreditPayment(payment, order, callback) {
        throw new Error("Method not implemented.");
    }
    confirmCreditPayment(payment, callback) {
        throw new Error("Method not implemented.");
    }
    cancelCreditPayment(payment, order, callback) {
        throw new Error("Method not implemented.");
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