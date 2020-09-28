"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const version1_1 = require("../data/version1");
const PaymentsCommandSet_1 = require("./PaymentsCommandSet");
const pip_services3_components_node_1 = require("pip-services3-components-node");
class PaymentsController {
    constructor() {
        this._logger = new pip_services3_components_node_1.CompositeLogger();
    }
    configure(config) {
        this._logger.configure(config);
    }
    setReferences(references) {
        this._paypalConnector = references.getOneOptional(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'connector', 'paypal', '*', '1.0'));
        this._stripeConnector = references.getOneOptional(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'connector', 'stripe', '*', '1.0'));
    }
    getCommandSet() {
        if (this._commandSet == null) {
            this._commandSet = new PaymentsCommandSet_1.PaymentsCommandSet(this);
        }
        return this._commandSet;
    }
    isOpen() {
        return this._paypalConnector != null || this._stripeConnector != null;
    }
    open(correlationId, callback) {
        callback(null);
    }
    close(correlationId, callback) {
        async.series([
            (callback) => {
                if (this._paypalConnector.isOpen) {
                    this._paypalConnector.close(correlationId, (err) => {
                        this._paypalConnector = null;
                        callback(err);
                    });
                }
                else {
                    callback(null);
                }
            },
            (callback) => {
                if (this._stripeConnector.isOpen) {
                    this._stripeConnector.close(correlationId, (err) => {
                        this._stripeConnector = null;
                        callback(err);
                    });
                }
                else {
                    callback(null);
                }
            }
        ], (err) => {
            callback(err);
        });
    }
    makePayment(correlationId, system, account, buyer, order, paymentMethod, amount, currencyCode, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.makePaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode).then(payment => {
            if (callback)
                callback(null, payment);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    submitPayment(correlationId, system, account, buyer, order, paymentMethod, amount, currencyCode, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.submitPaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode).then(payment => {
            if (callback)
                callback(null, payment);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    authorizePayment(correlationId, system, account, payment, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.authorizePaymentAsync(correlationId, account, payment).then(payment => {
            if (callback)
                callback(null, payment);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    checkPayment(correlationId, system, account, payment, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.checkPaymentAsync(correlationId, account, payment).then(payment => {
            if (callback)
                callback(null, payment);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    refundPayment(correlationId, system, account, payment, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.refundPaymentAsync(correlationId, account, payment).then(payment => {
            if (callback)
                callback(null, payment);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    makePayout(correlationId, system, account, seller, description, amount, currencyCode, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.makePayoutAsync(correlationId, account, seller, description, amount, currencyCode).then(payout => {
            if (callback)
                callback(null, payout);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    checkPayout(correlationId, system, account, payout, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.checkPayoutAsync(correlationId, account, payout).then(payout => {
            if (callback)
                callback(null, payout);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    cancelPayout(correlationId, system, account, payout, callback) {
        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector)
            return;
        connector.cancelPayoutAsync(correlationId, account, payout).then(payout => {
            if (callback)
                callback(null, payout);
        }).catch(err => {
            if (callback)
                callback(err, null);
        });
    }
    getSystemConnector(correlationId, system, callback) {
        switch (system) {
            case version1_1.PaymentSystemV1.PayPal: return this._paypalConnector;
            case version1_1.PaymentSystemV1.Stripe: return this._stripeConnector;
            default:
        }
        callback(new pip_services3_commons_node_1.BadRequestException(correlationId, 'ERR_PAYMENT_SYSTEM', 'Payment system is not supported')
            .withDetails('system', system), null);
        return null;
    }
}
exports.PaymentsController = PaymentsController;
//# sourceMappingURL=PaymentsController.js.map