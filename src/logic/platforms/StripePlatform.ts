import { IPaymentPlatform } from "./IPaymentPlatform";
import { PaymentV1, OrderV1, PaymentStatusV1 } from "../../data/version1";
import { CredentialParams, CredentialResolver } from "pip-services3-components-node";
import { ConfigParams, BadRequestException } from "pip-services3-commons-node";

import Stripe from 'stripe';


export class StripePlatform implements IPaymentPlatform {

    private _credentialsResolver: CredentialResolver = new CredentialResolver();

    private _credentials: CredentialParams;
    private _client: Stripe = null;
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

        if (error != null) {
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
        this._client = null;
        if (callback) callback(null);
    }

    makeCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any, response: any) => void): void {
        this.makeCreditPaymentAsync(payment, order).then(() => {
            
            if (this._autoConfirm) {
                this.confirmCreditPayment(payment, callback);
                return;
            }

            if (callback) callback(null, null);
        }).catch((err) => {
            payment.status = PaymentStatusV1.ErrorCreateOrder;
            if (callback) callback(err, null);
        });
    }

    confirmCreditPayment(payment: PaymentV1, callback: (err: any, response: any) => void): void {
        this.confirmCreditPaymentAsync(payment).then(() => {
            if (callback) callback(null, null);
        }).catch(err => {
            payment.status = PaymentStatusV1.ErrorConfirm;
            if (callback) callback(err, null);
        });
    }

    cancelCreditPayment(payment: PaymentV1, callback: (err: any, result: boolean) => void): void {
        if (payment.status != PaymentStatusV1.Confirmed) {
            callback(new Error('Payment is not confirmed'), null);
            return;
        }

        if (payment.platform_data.capture_id == null) {
            callback(new Error('Payment does not contain an identifier of intent'), null);
            return;
        }

        this._client.paymentIntents.cancel(payment.platform_data.capture_id).then(intent => {
            payment.status = PaymentStatusV1.Canceled;
            if (callback) callback(null, true);
        }).catch(err => {
            if (callback) callback(err, false);
        });
    }

    private async makeCreditPaymentAsync(payment: PaymentV1, order: OrderV1): Promise<void> {
        if (payment.method_id == null)
            throw new Error('Payment method id required');

        var intent = await this._client.paymentIntents.create({
            amount: Math.trunc(order.total * 100),
            currency: order.currency_code,
            metadata: {
                'payment_id': payment.id
            }
        });

        payment.platform_data.order_id = intent.id;
        payment.platform_data.confirm_data = intent.client_secret;
        payment.status = PaymentStatusV1.Unconfirmed;
    }

    private async confirmCreditPaymentAsync(payment: PaymentV1): Promise<void> {
        if (payment.status == PaymentStatusV1.Confirmed)
            throw new Error('Payment has already been confirmed');

        var intent_id = payment.platform_data.order_id;
        var intent = await this._client.paymentIntents.confirm(intent_id);

        if (intent.status == 'succeeded') {
            payment.platform_data.capture_id = payment.platform_data.order_id;
            payment.status = PaymentStatusV1.Confirmed;
        }
        else {
            payment.status = PaymentStatusV1.ErrorConfirm;
        }
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