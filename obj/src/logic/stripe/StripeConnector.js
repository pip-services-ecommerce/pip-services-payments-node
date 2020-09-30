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
exports.StripeConnector = void 0;
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const stripe_1 = require("stripe");
const util_1 = require("util");
const StripeOptions_1 = require("./StripeOptions");
const version1_1 = require("../../data/version1");
const version1_2 = require("../../data/version1");
const version1_3 = require("../../data/version1");
const version1_4 = require("../../data/version1");
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
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_METHOD_REQUIRED', 'Payment method id required');
            let client = this.createPaymentSystemClient(correlationId, account);
            if (!buyer.id)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_BUYER_REQUIRED', 'Buyer id required')
                    .withDetails('buyer', buyer);
            let customer = yield this.findItem(p => client.customers.list(p), x => x.metadata['customer_id'] == buyer.id, x => x.id);
            if (!customer)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_CUSTOMER_NOT_FOUND', 'Customer is not found by id')
                    .withDetails('buyer', buyer);
            order = order !== null && order !== void 0 ? order : { total: amount, currency_code: currencyCode, id: pip_services3_commons_node_1.IdGenerator.nextLong() };
            var intent = yield client.paymentIntents.create({
                amount: Math.trunc(order.total * 100),
                currency: order.currency_code,
                customer: customer.id,
                payment_method: paymentMethod.id
            });
            let payment = new version1_1.PaymentV1();
            payment.id = intent.id;
            payment.system = version1_3.PaymentSystemV1.Stripe;
            payment.confirm_data = intent.client_secret;
            payment.status = version1_2.PaymentStatusV1.Unconfirmed;
            payment.status_details = intent.status;
            return payment;
        });
    }
    authorizePaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.status == version1_2.PaymentStatusV1.Confirmed)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment has already been authorized')
                    .withDetails('payment', payment);
            let client = this.createPaymentSystemClient(correlationId, account);
            var intent = yield client.paymentIntents.confirm(payment.id);
            if (intent.status != 'succeeded')
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_AUTHORIZE', 'Cant authorize payment')
                    .withDetails('intent', intent);
            payment.status = version1_2.PaymentStatusV1.Confirmed;
            return payment;
        });
    }
    checkPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payment.id)
                return null;
            let client = this.createPaymentSystemClient(correlationId, account);
            var intent = yield client.paymentIntents.retrieve(payment.id);
            if (!intent)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_ID', 'Invalid payment id').withDetails('payment', payment);
            payment.status = this.toPublicStatus(intent.status);
            payment.status_details = intent.status;
            payment.confirm_data = intent.client_secret;
            return payment;
        });
    }
    refundPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            let intent = yield client.paymentIntents.retrieve(payment.id);
            if (intent) {
                if (intent.status.startsWith('requires_')) {
                    intent = yield client.paymentIntents.cancel(payment.id);
                    payment.status = version1_2.PaymentStatusV1.Canceled;
                    payment.status_details = 'cancel ' + intent.status;
                }
                else if (intent.status == 'succeeded') {
                    let refund = yield client.refunds.create({
                        payment_intent: payment.id
                    });
                    payment.status = version1_2.PaymentStatusV1.Canceled;
                    payment.status_details = 'refund ' + refund.status;
                }
            }
            return payment;
        });
    }
    makePayoutAsync(correlationId, account, seller, description, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            var customAccount = yield this.findCustomAccountAsync(client, seller.id);
            if (!customAccount)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYOUT', 'Custom account not found for seller')
                    .withDetails('seller', seller);
            yield this.updateSellerAccount(client, customAccount, seller);
            var transfer = yield client.transfers.create({
                amount: amount,
                currency: currencyCode,
                destination: customAccount.id,
                description: description,
            });
            var payout = {
                id: transfer.id,
                system: version1_3.PaymentSystemV1.Stripe,
                status: version1_4.PayoutStatusV1.Confirmed,
                account_id: customAccount.id
            };
            return payout;
        });
    }
    checkPayoutAsync(correlationId, account, payout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payout.id)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYOUT', 'Payout id not specified')
                    .withDetails('payout', payout);
            let client = this.createPaymentSystemClient(correlationId, account);
            let transfer = yield client.transfers.retrieve(payout.id, {
                expand: ['reversals']
            });
            payout.account_id = util_1.isString(transfer.destination) ? transfer.destination : transfer.destination.id;
            payout.reversal_id = transfer.reversed && transfer.reversals.data.length > 0 ? transfer.reversals.data[0].id : null;
            payout.status = transfer.reversed ? version1_4.PayoutStatusV1.Canceled : version1_4.PayoutStatusV1.Confirmed;
            return payout;
        });
    }
    cancelPayoutAsync(correlationId, account, payout) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            let reversal = yield client.transfers.createReversal(payout.id, {
                refund_application_fee: true
            });
            if (reversal != null) {
                payout.reversal_id = reversal.id;
                payout.status = version1_4.PayoutStatusV1.Canceled;
                return payout;
            }
            return payout;
        });
    }
    toPublicStatus(status) {
        switch (status) {
            case 'requires_payment_method': return version1_2.PaymentStatusV1.Created;
            case 'requires_confirmation': return version1_2.PaymentStatusV1.Unconfirmed;
            case 'requires_action': return version1_2.PaymentStatusV1.Unconfirmed;
            case 'processing': return version1_2.PaymentStatusV1.Unconfirmed;
            case 'requires_capture': return version1_2.PaymentStatusV1.Unconfirmed;
            case 'canceled': return version1_2.PaymentStatusV1.Canceled;
            case 'succeeded': return version1_2.PaymentStatusV1.Confirmed;
        }
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
    updateSellerAccount(client, customAccount, seller) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!customAccount.payouts_enabled) {
                return yield client.accounts.update(customAccount.id, {
                    email: seller.email,
                    // country: seller.address.country_code,
                    // type: 'custom',
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
                    capabilities: {
                        transfers: {
                            requested: true
                        }
                    },
                    // requested_capabilities: [
                    //     //'card_payments',
                    //     'transfers',
                    // ],
                    tos_acceptance: {
                        ip: seller.ip_address,
                        date: Math.floor(Date.now() / 1000),
                    },
                    metadata: {
                        seller_id: seller.id
                    },
                });
            }
        });
    }
    findCustomAccountAsync(client, customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customer_id) {
                return yield this.findItem(p => client.accounts.list(p), x => x.metadata['customer_id'] == customer_id, x => x.id);
            }
            return null;
        });
    }
    findItem(list, predicate, getId) {
        return __awaiter(this, void 0, void 0, function* () {
            let page;
            do {
                let params = {
                    limit: 100,
                };
                if (page && page.data.length > 0)
                    params.starting_after = getId(page.data[page.data.length - 1]);
                page = yield list(params);
                let item = page.data.find(predicate);
                if (item)
                    return item;
            } while (page.has_more);
            return null;
        });
    }
}
exports.StripeConnector = StripeConnector;
//# sourceMappingURL=StripeConnector.js.map