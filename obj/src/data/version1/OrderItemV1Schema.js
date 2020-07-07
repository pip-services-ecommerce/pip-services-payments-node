"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class OrderItemV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('name', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('description', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('amount', pip_services3_commons_node_2.TypeCode.Float);
        this.withRequiredProperty('amount_currency', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('tax', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('tax_currency', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('quantity', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('category', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.OrderItemV1Schema = OrderItemV1Schema;
//# sourceMappingURL=OrderItemV1Schema.js.map