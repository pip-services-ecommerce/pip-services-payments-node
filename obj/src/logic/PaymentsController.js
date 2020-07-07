"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const version1_1 = require("../data/version1");
const PaymentsCommandSet_1 = require("./PaymentsCommandSet");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const PlatformDataV1_1 = require("../data/version1/PlatformDataV1");
class PaymentsController {
    constructor() {
        this._logger = new pip_services3_components_node_1.CompositeLogger();
    }
    configure(config) {
        this._logger.configure(config);
    }
    setReferences(references) {
        this._persistence = references.getOneRequired(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'persistence', '*', '*', '1.0'));
        this._paypalPlatform = references.getOneOptional(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'platform', 'paypal', '*', '1.0'));
        this._stripePlatform = references.getOneOptional(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0'));
    }
    getCommandSet() {
        if (this._commandSet == null) {
            this._commandSet = new PaymentsCommandSet_1.PaymentsCommandSet(this);
        }
        return this._commandSet;
    }
    isOpen() {
        return this._paypalPlatform != null || this._stripePlatform != null;
    }
    open(correlationId, callback) {
        callback(null);
    }
    close(correlationId, callback) {
        if (this._paypalPlatform.isOpen) {
            this._paypalPlatform.close(correlationId, (err) => {
                if (err != null) {
                    if (callback)
                        callback(err);
                    return;
                }
                this._paypalPlatform = null;
            });
        }
        if (this._stripePlatform.isOpen) {
            this._stripePlatform.close(correlationId, (err) => {
                if (err != null) {
                    if (callback)
                        callback(err);
                    return;
                }
                this._stripePlatform = null;
            });
        }
    }
    makeCreditPayment(correlationId, platformId, methodId, order, callback) {
        let payment = new version1_1.PaymentV1();
        payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
        payment.order_id = order.id;
        payment.method_id = methodId;
        payment.platform_data = new PlatformDataV1_1.PlatformDataV1(platformId);
        payment.type = version1_1.PaymentTypesV1.Credit;
        payment.status = version1_1.PaymentStatusV1.Created;
        this._persistence.create(correlationId, payment, (err, res) => {
            if (err != null) {
                callback(err, null);
                return;
            }
            payment = res;
        });
        var platform = this.getPaymentPlatformById(platformId);
        if (platform != null) {
            platform.makeCreditPayment(payment, order, (err) => {
                if (err != null && callback) {
                    callback(err, null);
                    return;
                }
                this._persistence.update(correlationId, payment, callback);
            });
        }
        else {
            if (callback)
                callback(null, payment);
        }
    }
    confirmCreditPayment(correlationId, paymentId, callback) {
        let payment = this.getPaymentById(correlationId, paymentId, callback);
        if (payment != null) {
            var platform = this.getPaymentPlatformById(payment.platform_data.platform_id);
            if (platform != null) {
                platform.confirmCreditPayment(payment, (err) => {
                    if (err != null) {
                        callback(err, null);
                        return;
                    }
                });
            }
        }
        this._persistence.update(correlationId, payment, callback);
    }
    getPaymentById(correlationId, paymentId, callback) {
        let payment;
        this._persistence.getOneById(correlationId, paymentId, (err, item) => {
            if (err != null)
                callback(err, null);
            else
                payment = item;
        });
        return payment;
    }
    getPaymentPlatformById(platformId) {
        switch (platformId) {
            case 'paypal': return this._paypalPlatform;
            case 'stripe': return this._stripePlatform;
            default: return null;
        }
    }
    makeDebitPayment(correlationId, platformId, transactionId, destinationAccount, callback) {
        let payment = new version1_1.PaymentV1();
        payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
        payment.platform_data = new PlatformDataV1_1.PlatformDataV1(platformId);
        payment.type = version1_1.PaymentTypesV1.Debit;
        payment.status = version1_1.PaymentStatusV1.Created;
        this._persistence.create(correlationId, payment, callback);
    }
    cancelPayment(correlationId, paymentId, callback) {
        let payment = this.getPaymentById(correlationId, paymentId, callback);
        if (payment != null && payment.type == version1_1.PaymentTypesV1.Credit) {
            var platform = this.getPaymentPlatformById(payment.platform_data.platform_id);
            if (platform != null) {
                platform.cancelCreditPayment(payment, (err) => {
                    if (err != null) {
                        callback(err, null);
                        return;
                    }
                });
            }
        }
        this._persistence.update(correlationId, payment, callback);
    }
}
exports.PaymentsController = PaymentsController;
//# sourceMappingURL=PaymentsController.js.map