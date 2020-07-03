import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';
export declare class PaymentsServiceFactory extends Factory {
    static PaymentsMemoryPersistenceDescriptor: Descriptor;
    static PaymentsMongoDbPersistenceDescriptor: Descriptor;
    static ControllerDescriptor: Descriptor;
    static HttpServiceV1Descriptor: Descriptor;
    static OrdersHttpClientV1Descriptor: Descriptor;
    static PayPalPlatformDescriptor: Descriptor;
    static StripePlatformDescriptor: Descriptor;
    constructor();
}
