"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const version1_1 = require("../data/version1");
const PaymentsCommandSet_1 = require("./PaymentsCommandSet");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const PlatformDataV1_1 = require("../data/version1/PlatformDataV1");
const OrdersConnector_1 = require("./OrdersConnector");
class PaymentsController {
    constructor() {
        this._dependencyResolver = new pip_services3_commons_node_1.DependencyResolver();
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        this._dependencyResolver.put("orders", new pip_services3_commons_node_2.Descriptor("pip-services-orders", "client", "*", "*", "1.0"));
    }
    configure(config) {
        this._dependencyResolver.configure(config);
        this._logger.configure(config);
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = references.getOneRequired(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'persistence', '*', '*', '1.0'));
        this._paypalPlatform = references.getOneOptional(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'platform', 'paypal', '*', '1.0'));
        this._stripePlatform = references.getOneOptional(new pip_services3_commons_node_2.Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0'));
        let ordersClient = this._dependencyResolver.getOneRequired("orders");
        this._ordersConnector = new OrdersConnector_1.OrdersConnector(ordersClient);
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
    makeCreditPayment(correlationId, platformId, orderId, methodId, callback) {
        //  1. Create new payment object   
        let payment = new version1_1.PaymentV1();
        payment.id = pip_services3_commons_node_1.IdGenerator.nextLong();
        payment.order_id = orderId;
        payment.method_id = methodId;
        payment.platform_data = new PlatformDataV1_1.PlatformDataV1(platformId);
        payment.type = version1_1.PaymentTypesV1.Credit;
        payment.status = version1_1.PaymentStatusV1.Created;
        this._persistence.create(correlationId, payment, callback);
        //  2. Get order by id with items list
        var orderV1;
        this._ordersConnector.getOrderById(correlationId, orderId, (err, res) => {
            if (err != null) {
                callback(err, null);
                return;
            }
            orderV1 = res;
        });
        //  3. Create payment and send    
        var platform = this.getPaymentPlatformById(platformId);
        if (platform != null) {
            platform.makeCreditPayment(payment, orderV1, (err) => {
                if (err != null) {
                    callback(err, null);
                    return;
                }
            });
        }
        this._persistence.update(correlationId, payment, callback);
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
        callback(null, pip_services3_commons_node_1.IdGenerator.nextLong());
    }
    cancelPayment(correlationId, paymentId, callback) {
        let payment = this.getPaymentById(correlationId, paymentId, callback);
        if (payment != null && payment.type == version1_1.PaymentTypesV1.Credit) {
            var orderV1;
            this._ordersConnector.getOrderById(correlationId, payment.order_id, (err, res) => {
                if (err != null)
                    throw err;
                orderV1 = res;
            });
            var platform = this.getPaymentPlatformById(payment.platform_data.platform_id);
            if (platform != null) {
                platform.cancelCreditPayment(payment, orderV1, (err) => {
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