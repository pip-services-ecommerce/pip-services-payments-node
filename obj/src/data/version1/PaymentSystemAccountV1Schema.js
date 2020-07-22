"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PaymentSystemAccountV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withOptionalProperty('access_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('access_key', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.PaymentSystemAccountV1Schema = PaymentSystemAccountV1Schema;
//# sourceMappingURL=PaymentSystemAccountV1Schema.js.map