"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PayoutV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('system', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('status', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('status_details', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('account_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('reversal_id', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.PayoutV1Schema = PayoutV1Schema;
//# sourceMappingURL=PayoutV1Schema.js.map