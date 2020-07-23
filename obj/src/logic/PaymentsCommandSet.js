"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const version1_1 = require("../data/version1");
const PaymentSystemAccountV1Schema_1 = require("../data/version1/PaymentSystemAccountV1Schema");
const BuyerV1Schema_1 = require("../data/version1/BuyerV1Schema");
const PaymentMethodV1Schema_1 = require("../data/version1/PaymentMethodV1Schema");
const PayoutV1Schema_1 = require("../data/version1/PayoutV1Schema");
const SellerV1Schema_1 = require("../data/version1/SellerV1Schema");
class PaymentsCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(controller) {
        super();
        this._controller = controller;
        this.addCommand(this.makeMakePaymentCommand());
        this.addCommand(this.makeSubmitPaymentCommand());
        this.addCommand(this.makeAuthorizePaymentCommand());
        this.addCommand(this.makeCheckPaymentCommand());
        this.addCommand(this.makeRefundPaymentCommand());
        this.addCommand(this.makeMakePayoutCommand());
        this.addCommand(this.makeCheckPayoutCommand());
        this.addCommand(this.makeCancelPayoutCommand());
    }
    makeMakePaymentCommand() {
        return new pip_services3_commons_node_2.Command('make_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withRequiredProperty('buyer', new BuyerV1Schema_1.BuyerV1Schema())
            .withOptionalProperty('order', new version1_1.OrderV1Schema())
            .withOptionalProperty('payment_method', new PaymentMethodV1Schema_1.PaymentMethodV1Schema())
            .withOptionalProperty('amount', pip_services3_commons_node_4.TypeCode.Float)
            .withOptionalProperty('currency_code', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let buyer = args.getAsObject('buyer');
            let order = args.getAsObject('order');
            let paymentMethod = args.getAsObject('payment_method');
            let amount = args.getAsNullableFloat('amount');
            let currencyCode = args.getAsNullableString('currency_code');
            this._controller.makePayment(correlationId, system, account, buyer, order, paymentMethod, amount, currencyCode, callback);
        });
    }
    makeSubmitPaymentCommand() {
        return new pip_services3_commons_node_2.Command('submit_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withRequiredProperty('buyer', new BuyerV1Schema_1.BuyerV1Schema())
            .withOptionalProperty('order', new version1_1.OrderV1Schema())
            .withOptionalProperty('payment_method', new PaymentMethodV1Schema_1.PaymentMethodV1Schema())
            .withOptionalProperty('amount', pip_services3_commons_node_4.TypeCode.Float)
            .withOptionalProperty('currency_code', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let buyer = args.getAsObject('buyer');
            let order = args.getAsObject('order');
            let paymentMethod = args.getAsObject('payment_method');
            let amount = args.getAsNullableFloat('amount');
            let currencyCode = args.getAsNullableString('currency_code');
            this._controller.submitPayment(correlationId, system, account, buyer, order, paymentMethod, amount, currencyCode, callback);
        });
    }
    makeAuthorizePaymentCommand() {
        return new pip_services3_commons_node_2.Command('authorize_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withOptionalProperty('payment', new version1_1.PaymentV1Schema()), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let payment = args.getAsObject('payment');
            this._controller.authorizePayment(correlationId, system, account, payment, callback);
        });
    }
    makeCheckPaymentCommand() {
        return new pip_services3_commons_node_2.Command('check_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withOptionalProperty('payment', new version1_1.PaymentV1Schema()), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let payment = args.getAsObject('payment');
            this._controller.checkPayment(correlationId, system, account, payment, callback);
        });
    }
    makeRefundPaymentCommand() {
        return new pip_services3_commons_node_2.Command('refund_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withOptionalProperty('payment', new version1_1.PaymentV1Schema()), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let payment = args.getAsObject('payment');
            this._controller.refundPayment(correlationId, system, account, payment, callback);
        });
    }
    makeMakePayoutCommand() {
        return new pip_services3_commons_node_2.Command('make_payout', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withRequiredProperty('seller', new SellerV1Schema_1.SellerV1Schema())
            .withOptionalProperty('payout_method', new version1_1.PayoutMethodV1Schema())
            .withOptionalProperty('description', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('amount', pip_services3_commons_node_4.TypeCode.Float)
            .withRequiredProperty('currency_code', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let seller = args.getAsObject('seller');
            let payoutMethod = args.getAsObject('payout_method');
            let description = args.getAsNullableString('description');
            let amount = args.getAsFloat('amount');
            let currencyCode = args.getAsString('currency_code');
            this._controller.makePayout(correlationId, system, account, seller, payoutMethod, description, amount, currencyCode, callback);
        });
    }
    makeCheckPayoutCommand() {
        return new pip_services3_commons_node_2.Command('check_payout', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withRequiredProperty('payout', new PayoutV1Schema_1.PayoutV1Schema()), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let payout = args.getAsObject('payout');
            this._controller.checkPayout(correlationId, system, account, payout, callback);
        });
    }
    makeCancelPayoutCommand() {
        return new pip_services3_commons_node_2.Command('cancel_payout', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('system', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('account', new PaymentSystemAccountV1Schema_1.PaymentSystemAccountV1Schema())
            .withRequiredProperty('payout', new PayoutV1Schema_1.PayoutV1Schema()), (correlationId, args, callback) => {
            let system = args.getAsString('system');
            let account = args.getAsObject('account');
            let payout = args.getAsObject('payout');
            this._controller.cancelPayout(correlationId, system, account, payout, callback);
        });
    }
}
exports.PaymentsCommandSet = PaymentsCommandSet;
//# sourceMappingURL=PaymentsCommandSet.js.map