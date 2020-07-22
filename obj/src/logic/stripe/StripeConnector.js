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
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const stripe_1 = require("stripe");
const util_1 = require("util");
const StripeOptions_1 = require("./StripeOptions");
const PaymentSystemV1_1 = require("../../data/version1/PaymentSystemV1");
const PayoutStatusV1_1 = require("../../data/version1/PayoutStatusV1");
class StripeConnector {
    constructor() {
        this._credentialsResolver = new pip_services3_components_node_1.CredentialResolver();
        this._autoConfirm = true;
    }
    configure(config) {
        this._credentialsResolver.configure(config);
        this._stripeOptions = new StripeOptions_1.StripeOptions(config);
        this._autoConfirm = config.getAsBooleanWithDefault("options.auto_confirm", this._autoConfirm);
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
        if (callback)
            callback(null);
    }
    makePaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let payment = yield this.submitPaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode);
            return yield this.authorizePaymentAsync(correlationId, account, payment);
        });
    }
    submitPaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!paymentMethod || !paymentMethod.id)
                throw new Error('Payment method id required');
            let client = this.createPaymentSystemClient(correlationId, account);
            let customerId = yield this.fromPublicCustomerAsync(client, buyer.id);
            if (!customerId)
                throw new Error('Buyer id required');
            order = (order !== null && order !== void 0 ? order : { total: amount, currency_code: currencyCode, id: pip_services3_commons_node_1.IdGenerator.nextLong() });
            let payment = new version1_1.PaymentV1();
            payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
            payment.system = PaymentSystemV1_1.PaymentSystemV1.Stripe;
            var intent = yield client.paymentIntents.create({
                amount: Math.trunc(order.total * 100),
                currency: order.currency_code,
                customer: customerId,
                payment_method: paymentMethod.id,
                metadata: {
                    'payment_id': payment.id
                }
            });
            payment.order_id = intent.id;
            payment.confirm_data = intent.client_secret;
            payment.status = version1_1.PaymentStatusV1.Unconfirmed;
            payment.status_details = intent.status;
            return payment;
        });
    }
    authorizePaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.status == version1_1.PaymentStatusV1.Confirmed)
                throw new Error('Payment has already been authorized');
            let client = this.createPaymentSystemClient(correlationId, account);
            var intent_id = payment.order_id;
            var intent = yield client.paymentIntents.confirm(intent_id);
            if (intent.status != 'succeeded')
                throw new Error('Cant authorize payment: ' + intent.status);
            payment.capture_id = payment.order_id;
            payment.status = version1_1.PaymentStatusV1.Confirmed;
            return payment;
        });
    }
    checkPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payment.order_id)
                return null;
            let client = this.createPaymentSystemClient(correlationId, account);
            var intent_id = payment.order_id;
            var intent = yield client.paymentIntents.retrieve(intent_id);
            let payment_id = intent.metadata['payment_id'];
            if (!payment_id || payment.id != payment_id)
                throw new Error('Invalid payment id');
            payment.status = this.toPublicStatus(intent.status);
            payment.status_details = intent.status;
            payment.confirm_data = intent.client_secret;
            return payment;
        });
    }
    refundPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.status != version1_1.PaymentStatusV1.Confirmed)
                throw new Error('Payment is not confirmed');
            if (!payment.capture_id)
                throw new Error('Payment does not contain an identifier of intent');
            let client = this.createPaymentSystemClient(correlationId, account);
            let intent = yield client.paymentIntents.retrieve(payment.capture_id);
            if (intent) {
                if (intent.status.startsWith('requires_')) {
                    intent = yield client.paymentIntents.cancel(payment.capture_id);
                    payment.status = version1_1.PaymentStatusV1.Canceled;
                    payment.status_details = 'cancel ' + intent.status;
                }
                else if (intent.status == 'succeeded') {
                    let refund = yield client.refunds.create({
                        payment_intent: payment.capture_id
                    });
                    payment.status = version1_1.PaymentStatusV1.Canceled;
                    payment.status_details = 'refund ' + refund.status;
                }
            }
            return payment;
        });
    }
    makePayoutAsync(correlationId, account, seller, description, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            let sellerAcc = yield this.findSellerAccount(client, seller.id);
            if (!sellerAcc) {
                sellerAcc = yield this.createSellerAccount(client, seller, null);
            }
            var transfer = yield client.transfers.create({
                amount: amount,
                currency: currencyCode,
                destination: sellerAcc.id,
                description: description,
            });
            var payout = {
                id: pip_services3_commons_node_1.IdGenerator.nextLong(),
                system: PaymentSystemV1_1.PaymentSystemV1.Stripe,
                status: PayoutStatusV1_1.PayoutStatusV1.Confirmed,
                transfer_id: transfer.id,
                account_id: sellerAcc.id
            };
            return payout;
        });
    }
    checkPayoutAsync(correlationId, account, payout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payout.transfer_id)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYOUT', 'Transfer id not specified')
                    .withDetails('payout', payout);
            let client = this.createPaymentSystemClient(correlationId, account);
            let transfer = yield client.transfers.retrieve(payout.transfer_id, {
                expand: ['reversals']
            });
            payout.account_id = util_1.isString(transfer.destination) ? transfer.destination : transfer.destination.id;
            payout.reversal_id = transfer.reversed && transfer.reversals.data.length > 0 ? transfer.reversals.data[0].id : null;
            payout.status = transfer.reversed ? PayoutStatusV1_1.PayoutStatusV1.Canceled : PayoutStatusV1_1.PayoutStatusV1.Confirmed;
            return payout;
        });
    }
    cancelPayoutAsync(correlationId, account, payout) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            let reversal = client.transfers.createReversal(payout.transfer_id, {
                refund_application_fee: true
            });
            if (reversal != null) {
                payout.status = PayoutStatusV1_1.PayoutStatusV1.Canceled;
                return payout;
            }
            return payout;
        });
    }
    toPublicStatus(status) {
        switch (status) {
            case 'requires_payment_method': return version1_1.PaymentStatusV1.Created;
            case 'requires_confirmation': return version1_1.PaymentStatusV1.Unconfirmed;
            case 'requires_action': return version1_1.PaymentStatusV1.Unconfirmed;
            case 'processing': return version1_1.PaymentStatusV1.Unconfirmed;
            case 'requires_capture': return version1_1.PaymentStatusV1.Unconfirmed;
            case 'canceled': return version1_1.PaymentStatusV1.Canceled;
            case 'succeeded': return version1_1.PaymentStatusV1.Confirmed;
        }
    }
    fromPublicCustomerAsync(client, customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customer_id) {
                var customers = yield client.customers.list({});
                for (let index = 0; index < customers.data.length; index++) {
                    const customer = customers.data[index];
                    if (customer.metadata['customer_id'] == customer_id) {
                        return customer.id;
                    }
                }
            }
            return null;
        });
    }
    createPaymentSystemClient(correlationId, account) {
        let secretKey;
        if (account) {
            secretKey = account.access_key;
        }
        else if (this._credentials) {
            secretKey = this._credentials.getAccessKey();
        }
        else
            throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_CREDENTIALS', 'Credentials to connect to the payment system is not specified');
        let client = new stripe_1.default(secretKey, {
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
    createSellerAccount(client, seller, paymentMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client.accounts.create({
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
                external_account: 'tok_visa_debit_us_transferSuccess',
                requested_capabilities: [
                    //'card_payments',
                    'transfers',
                ],
                tos_acceptance: {
                    ip: seller.ip_address,
                    date: Math.floor(Date.now() / 1000),
                },
                //external_account: 
                metadata: {
                    seller_id: seller.id
                },
            });
        });
    }
    findSellerAccount(client, seller_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let starting_after;
            let page;
            do {
                let params = {
                    limit: 100,
                };
                if (starting_after)
                    params.starting_after = starting_after;
                page = yield client.accounts.list({
                    limit: 100,
                    starting_after: starting_after
                });
                let account = page.data.find(x => x.metadata['seller_id'] == seller_id);
                if (account)
                    return account;
            } while (page.has_more);
            return null;
        });
    }
}
exports.StripeConnector = StripeConnector;
//# sourceMappingURL=StripeConnector.js.map