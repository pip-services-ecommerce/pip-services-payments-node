import { IPaymentPlatform } from "./IPaymentPlatform";
import { PaymentV1, OrderV1 } from "../../data/version1";
import { CredentialParams, CredentialResolver } from "pip-services3-components-node";
import { ConfigParams } from "pip-services3-commons-node";

import Stripe from 'stripe';


export class StripePlatform implements IPaymentPlatform {

    private _credentialsResolver: CredentialResolver = new CredentialResolver();

    private _credentials: CredentialParams;
    private _client: any = null;
    private _stripeOptions: StripeOptions;

    constructor() {
    }

    configure(config: ConfigParams): void {
        this._credentialsResolver.configure(config);
        this._stripeOptions = new StripeOptions(config);
    }

    isOpen(): boolean {
        return this._client != null;
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

        if (error != null)
        {
            if (callback) callback(error);
            return;
        }

        let secretKey = this._credentials.getAccessKey();

        this._client = new Stripe(secretKey, {
            apiVersion: this._stripeOptions.apiVersion,
            maxNetworkRetries: this._stripeOptions.maxNetworkRetries,
            httpAgent: this._stripeOptions.httpAgent,
            timeout: this._stripeOptions.timeout,
            host: this._stripeOptions.host,
            port: this._stripeOptions.port,
            protocol: this._stripeOptions.protocol,
            telemetry: this._stripeOptions.telemetry
        });

        if (callback) callback(null);
    }

    close(correlationId: string, callback?: (err: any) => void): void {
        throw new Error("Method not implemented.");
    }

    makeCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any, response: any) => void): void {
        throw new Error("Method not implemented.");
    }
    confirmCreditPayment(payment: PaymentV1, callback: (err: any, response: any) => void): void {
        throw new Error("Method not implemented.");
    }
    cancelCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any, result: boolean) => void): void {
        throw new Error("Method not implemented.");
    }

}

class StripeOptions implements Stripe.StripeConfig {
    /// Stripe API version to be used. If not set the account's default version will be used.
    /// Default: null
    public apiVersion: Stripe.LatestApiVersion;
    /// The amount of times a request should be retried.
    /// Default: 0
    public maxNetworkRetries: number = 0;
    /// The amount of times a request should be retried.
    /// Default: 80000
    public timeout: number = 80000;
    /// Host that requests are made to.
    /// Default: 'api.stripe.com'
    public host: string = 'api.stripe.com';
    /// Port that requests are made to.
    /// Default: 443
    public port: number = 443;
    /// 'https' or 'http'. http is never appropriate for sending requests to Stripe servers, and we strongly discourage http, 
    /// even in local testing scenarios, as this can result in your credentials being transmitted over an insecure channel.
    /// Default: https
    public protocol?: 'https' | 'http';
    /// Allow Stripe to send latency telemetry.
    /// Default: true
    public telemetry: boolean = true;

    /// Proxy agent to be used by the library.
    /// Default: null
    public httpAgent: any = null;

    constructor(config: ConfigParams) {
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
                this.httpAgent = new ProxyAgent(this.httpAgent)
            }
        }
    }
}