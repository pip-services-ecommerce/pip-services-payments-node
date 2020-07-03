import { CommandableHttpService } from 'pip-services3-rpc-node';
import { Descriptor } from 'pip-services3-commons-node';

export class PaymentsHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/payments');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-payments', 'controller', '*', '*', '1.0'));
    }
}