"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PayoutMethodV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('type', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('card', null);
        this.withOptionalProperty('bank_account', null);
        this.withOptionalProperty('billing_address', null);
        this.withOptionalProperty('token', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.PayoutMethodV1Schema = PayoutMethodV1Schema;
//# sourceMappingURL=PayoutMethodV1Schema.js.map