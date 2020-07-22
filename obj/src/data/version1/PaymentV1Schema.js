"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PaymentV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('system', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('status', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('status_details', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('order_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('order_amount', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('order_currency', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('authorization_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('confirm_data', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('capture_id', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.PaymentV1Schema = PaymentV1Schema;
//# sourceMappingURL=PaymentV1Schema.js.map