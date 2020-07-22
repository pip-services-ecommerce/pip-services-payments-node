import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { PaymentsController } from '../logic/PaymentsController';
import { PaymentsHttpServiceV1 } from '../services/version1/PaymentsHttpServiceV1';
import { PayPalConnector } from '../logic/paypal/PayPalConnector';
import { StripeConnector } from '../logic/stripe/StripeConnector';

export class PaymentsServiceFactory extends Factory {
    public static ControllerDescriptor = new Descriptor('pip-services-payments', 'controller', 'default', '*', '1.0');
    public static HttpServiceV1Descriptor = new Descriptor('pip-services-payments', 'service', 'http', '*', '1.0');

    public static PayPalConnectorDescriptor = new Descriptor('pip-services-payments', 'connector', 'paypal', '*', '1.0');
    public static StripeConnectorDescriptor = new Descriptor('pip-services-payments', 'connector', 'stripe', '*', '1.0');

    constructor() {
        super();

        this.registerAsType(PaymentsServiceFactory.ControllerDescriptor, PaymentsController);
        this.registerAsType(PaymentsServiceFactory.HttpServiceV1Descriptor, PaymentsHttpServiceV1);

        this.registerAsType(PaymentsServiceFactory.PayPalConnectorDescriptor, PayPalConnector);
        this.registerAsType(PaymentsServiceFactory.StripeConnectorDescriptor, StripeConnector);
    }
}