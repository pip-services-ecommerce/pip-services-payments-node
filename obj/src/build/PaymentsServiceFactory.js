"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const PaymentsMemoryPersistence_1 = require("../persistence/PaymentsMemoryPersistence");
const PaymentsMongoDbPersistence_1 = require("../persistence/PaymentsMongoDbPersistence");
const PaymentsController_1 = require("../logic/PaymentsController");
const PaymentsHttpServiceV1_1 = require("../services/version1/PaymentsHttpServiceV1");
const platforms_1 = require("../logic/platforms");
class PaymentsServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(PaymentsServiceFactory.PaymentsMemoryPersistenceDescriptor, PaymentsMemoryPersistence_1.PaymentsMemoryPersistence);
        this.registerAsType(PaymentsServiceFactory.PaymentsMongoDbPersistenceDescriptor, PaymentsMongoDbPersistence_1.PaymentsMongoDbPersistence);
        this.registerAsType(PaymentsServiceFactory.ControllerDescriptor, PaymentsController_1.PaymentsController);
        this.registerAsType(PaymentsServiceFactory.HttpServiceV1Descriptor, PaymentsHttpServiceV1_1.PaymentsHttpServiceV1);
        this.registerAsType(PaymentsServiceFactory.PayPalConnectorDescriptor, platforms_1.PayPalConnector);
        this.registerAsType(PaymentsServiceFactory.StripeConnectorDescriptor, platforms_1.StripeConnector);
    }
}
exports.PaymentsServiceFactory = PaymentsServiceFactory;
PaymentsServiceFactory.PaymentsMemoryPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'persistence', 'memory', '*', '1.0');
PaymentsServiceFactory.PaymentsMongoDbPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'persistence', 'mongodb', '*', '1.0');
PaymentsServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'controller', 'default', '*', '1.0');
PaymentsServiceFactory.HttpServiceV1Descriptor = new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'service', 'http', '*', '1.0');
PaymentsServiceFactory.PayPalConnectorDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'platform', 'paypal', '*', '1.0');
PaymentsServiceFactory.StripeConnectorDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0');
//# sourceMappingURL=PaymentsServiceFactory.js.map