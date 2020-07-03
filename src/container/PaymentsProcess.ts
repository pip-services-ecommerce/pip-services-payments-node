import { ProcessContainer } from 'pip-services3-container-node';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';

import { PaymentsServiceFactory } from '../build/PaymentsServiceFactory';

export class PaymentsProcess extends ProcessContainer {
    public constructor() {
        super('pip-services-payments', 'Payments microservice');

        this._factories.add(new PaymentsServiceFactory());
        this._factories.add(new DefaultRpcFactory());
    }
}