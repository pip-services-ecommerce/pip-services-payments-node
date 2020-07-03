"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const PaymentsServiceFactory_1 = require("../build/PaymentsServiceFactory");
class PaymentsProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super('pip-services-payments', 'Payments microservice');
        this._factories.add(new PaymentsServiceFactory_1.PaymentsServiceFactory());
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory());
    }
}
exports.PaymentsProcess = PaymentsProcess;
//# sourceMappingURL=PaymentsProcess.js.map