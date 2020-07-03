"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
class PaymentsCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(controller) {
        super();
        this._controller = controller;
        this.addCommand(this.makeMakeCreditPaymentCommand());
        this.addCommand(this.makeConfirmCreditPaymentCommand());
        this.addCommand(this.makeMakeDebitPaymentCommand());
        this.addCommand(this.makeCancelPaymentCommand());
    }
    makeMakeCreditPaymentCommand() {
        return new pip_services3_commons_node_2.Command('make_credit_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('platform_id', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('order_id', pip_services3_commons_node_4.TypeCode.String)
            .withOptionalProperty('method_id', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let platformId = args.getAsString('platform_id');
            let orderId = args.getAsString('order_id');
            let methodId = args.getAsString('method_id');
            this._controller.makeCreditPayment(correlationId, platformId, orderId, methodId, callback);
        });
    }
    makeConfirmCreditPaymentCommand() {
        return new pip_services3_commons_node_2.Command('confirm_credit_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('payment_id', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let paymentId = args.getAsString('payment_id');
            this._controller.confirmCreditPayment(correlationId, paymentId, callback);
        });
    }
    makeMakeDebitPaymentCommand() {
        return new pip_services3_commons_node_2.Command('make_debit_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('platform_id', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('transaction_id', pip_services3_commons_node_4.TypeCode.String)
            .withOptionalProperty('destination_account', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let platformId = args.getAsString('platform_id');
            let transactionId = args.getAsString('transaction_id');
            let destinationAccount = args.getAsString('destination_account');
            this._controller.makeDebitPayment(correlationId, platformId, transactionId, destinationAccount, callback);
        });
    }
    makeCancelPaymentCommand() {
        return new pip_services3_commons_node_2.Command('cancel_payment', new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('payment_id', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let paymentId = args.getAsString('payment_id');
            this._controller.cancelPayment(correlationId, paymentId, callback);
        });
    }
}
exports.PaymentsCommandSet = PaymentsCommandSet;
//# sourceMappingURL=PaymentsCommandSet.js.map