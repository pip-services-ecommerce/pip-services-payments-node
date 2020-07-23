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
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_BUYER_REQUIRED', 'Buyer id required').withDetails('buyer', buyer);
            let customer = yield this.findItem(p => client.customers.list(p), x => x.metadata['customer_id'] == buyer.id, x => x.id);
            if (!customer)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_CUSTOMER_NOT_FOUND', 'Customer is not found by id').withDetails('buyer', buyer);
            order = (order !== null && order !== void 0 ? order : { total: amount, currency_code: currencyCode, id: pip_services3_commons_node_1.IdGenerator.nextLong() });
            let payment = new version1_1.PaymentV1();
            payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
            payment.system = version1_3.PaymentSystemV1.Stripe;
            var intent = yield client.paymentIntents.create({
                amount: Math.trunc(order.total * 100),
                currency: order.currency_code,
                customer: customer.id,
                payment_method: paymentMethod.id,
                metadata: {
                    'payment_id': payment.id
                }
            });
            payment.order_id = intent.id;
            payment.confirm_data = intent.client_secret;
            payment.status = version1_2.PaymentStatusV1.Unconfirmed;
            payment.status_details = intent.status;
            return payment;
        });
    }
    authorizePaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.status == version1_2.PaymentStatusV1.Confirmed)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment has already been authorized').withDetails('payment', payment);
            let client = this.createPaymentSystemClient(correlationId, account);
            var intent_id = payment.order_id;
            var intent = yield client.paymentIntents.confirm(intent_id);
            if (intent.status != 'succeeded')
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_AUTHORIZE', 'Cant authorize payment').withDetails('intent', intent);
            payment.capture_id = payment.order_id;
            payment.status = version1_2.PaymentStatusV1.Confirmed;
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
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_ID', 'Invalid payment id').withDetails('payment', payment);
            payment.status = this.toPublicStatus(intent.status);
            payment.status_details = intent.status;
            payment.confirm_data = intent.client_secret;
            return payment;
        });
    }
    refundPaymentAsync(correlationId, account, payment) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payment.status != version1_2.PaymentStatusV1.Confirmed)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment is not confirmed')
                    .withDetails('payment', payment);
            if (!payment.capture_id)
                throw new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_STATUS', 'Payment does not contain an identifier of intent (capture_id)')
                    .withDetails('payment', payment);
            let client = this.createPaymentSystemClient(correlationId, account);
            let intent = yield client.paymentIntents.retrieve(payment.capture_id);
            if (intent) {
                if (intent.status.startsWith('requires_')) {
                    intent = yield client.paymentIntents.cancel(payment.capture_id);
                    payment.status = version1_2.PaymentStatusV1.Canceled;
                    payment.status_details = 'cancel ' + intent.status;
                }
                else if (intent.status == 'succeeded') {
                    let refund = yield client.refunds.create({
                        payment_intent: payment.capture_id
                    });
                    payment.status = version1_2.PaymentStatusV1.Canceled;
                    payment.status_details = 'refund ' + refund.status;
                }
            }
            return payment;
        });
    }
    makePayoutAsync(correlationId, account, seller, payoutMethod, description, amount, currencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = this.createPaymentSystemClient(correlationId, account);
            let sellerAcc = yield this.findItem(p => client.accounts.list(p), x => x.metadata['seller_id'] == seller.id, x => x.id);
            if (!sellerAcc) {
                sellerAcc = yield this.createSellerAccount(client, seller, payoutMethod);
            }
            var transfer = yield client.transfers.create({
                amount: amount,
                currency: currencyCode,
                destination: sellerAcc.id,
                description: description,
            });
            var payout = {
                id: pip_services3_commons_node_1.IdGenerator.nextLong(),
                system: version1_3.PaymentSystemV1.Stripe,
                status: version1_4.PayoutStatusV1.Confirmed,
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
            payout.status = transfer.reversed ? version1_4.PayoutStatusV1.Canceled : version1_4.PayoutStatusV1.Confirmed;
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
    createSellerAccount(client, seller, payoutMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            let payoutToken = yield this.createPayoutToken(client, payoutMethod);
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
                external_account: payoutToken,
                requested_capabilities: [
                    //'card_payments',
                    'transfers',
                ],
                tos_acceptance: {
                    ip: seller.ip_address,
                    date: Math.floor(Date.now() / 1000),
                },
                metadata: {
                    seller_id: seller.id
                },
            });
        });
    }
    createPayoutToken(client, payoutMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            let params;
            if (payoutMethod.token)
                return payoutMethod.token;
            if (payoutMethod.type == version1_1.PayoutMethodTypeV1.BankAccount) {
                let account = payoutMethod.bank_account;
                params = {
                    bank_account: {
                        account_number: account.number,
                        country: account.country,
                        currency: account.currency,
                        account_holder_name: account.first_name + ' ' + account.last_name,
                        account_holder_type: 'individual',
                        routing_number: account.routing_number
                    },
                };
            }
            else if (payoutMethod.type == version1_1.PayoutMethodTypeV1.DebitCard) {
                let card = payoutMethod.card;
                params = {
                    card: {
                        //name: card.?
                        //currency: card.?
                        exp_month: card.expire_month.toString(),
                        exp_year: card.expire_year.toString(),
                        number: card.number,
                        cvc: card.ccv,
                        address_city: payoutMethod.billing_address.city,
                        address_country: payoutMethod.billing_address.country_code,
                        address_line1: payoutMethod.billing_address.line1,
                        address_line2: payoutMethod.billing_address.line2,
                        address_state: payoutMethod.billing_address.state,
                        address_zip: payoutMethod.billing_address.postal_code,
                    },
                };
            }
            let token = yield client.tokens.create(params);
            return token.id;
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