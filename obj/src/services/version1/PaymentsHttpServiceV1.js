"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
class PaymentsHttpServiceV1 extends pip_services3_rpc_node_1.CommandableHttpService {
    constructor() {
        super('v1/payments');
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-payments', 'controller', '*', '*', '1.0'));
    }
}
exports.PaymentsHttpServiceV1 = PaymentsHttpServiceV1;
//# sourceMappingURL=PaymentsHttpServiceV1.js.map