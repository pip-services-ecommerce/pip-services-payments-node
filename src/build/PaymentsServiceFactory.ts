import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { PaymentsMemoryPersistence } from '../persistence/PaymentsMemoryPersistence';
import { PaymentsMongoDbPersistence } from '../persistence/PaymentsMongoDbPersistence';
import { PaymentsController } from '../logic/PaymentsController';
import { PaymentsHttpServiceV1 } from '../services/version1/PaymentsHttpServiceV1';
import { MockOrdersClientV1 } from '../logic/mocks/MockOrdersClientV1';
import { PayPalPlatform, StripePlatform } from '../logic/platforms';

export class PaymentsServiceFactory extends Factory {
    public static PaymentsMemoryPersistenceDescriptor = new Descriptor('pip-services-payments', 'persistence', 'memory', '*', '1.0');
    public static PaymentsMongoDbPersistenceDescriptor = new Descriptor('pip-services-payments', 'persistence', 'mongodb', '*', '1.0');
    public static ControllerDescriptor = new Descriptor('pip-services-payments', 'controller', 'default', '*', '1.0');
    public static HttpServiceV1Descriptor = new Descriptor('pip-services-payments', 'service', 'http', '*', '1.0');

    public static OrdersHttpClientV1Descriptor = new Descriptor('pip-services-orders', 'client', 'http', '*', '1.0');

    public static PayPalPlatformDescriptor = new Descriptor('pip-services-payments', 'platform', 'paypal', '*', '1.0');
    public static StripePlatformDescriptor = new Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0');

    constructor() {
        super();

        this.registerAsType(PaymentsServiceFactory.PaymentsMemoryPersistenceDescriptor, PaymentsMemoryPersistence);
        this.registerAsType(PaymentsServiceFactory.PaymentsMongoDbPersistenceDescriptor, PaymentsMongoDbPersistence);
        this.registerAsType(PaymentsServiceFactory.ControllerDescriptor, PaymentsController);
        this.registerAsType(PaymentsServiceFactory.HttpServiceV1Descriptor, PaymentsHttpServiceV1);

        this.registerAsType(PaymentsServiceFactory.OrdersHttpClientV1Descriptor, MockOrdersClientV1/* OrdersHttpClientV1*/);

        this.registerAsType(PaymentsServiceFactory.PayPalPlatformDescriptor, PayPalPlatform);
        this.registerAsType(PaymentsServiceFactory.StripePlatformDescriptor, StripePlatform);
    }
}