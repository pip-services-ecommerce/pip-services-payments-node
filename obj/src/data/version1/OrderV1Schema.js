"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const OrderItemV1Schema_1 = require("./OrderItemV1Schema");
class OrderV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('number', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('currency_code', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('shipping_details', null);
        this.withOptionalProperty('items', new pip_services3_commons_node_1.ArraySchema(new OrderItemV1Schema_1.OrderItemV1Schema()));
        this.withOptionalProperty('subtotal', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('discount', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('discount_code', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('shipping_cost', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('tax_percent', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('tax', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('other_cost', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('total', pip_services3_commons_node_2.TypeCode.Float);
    }
}
exports.OrderV1Schema = OrderV1Schema;
//# sourceMappingURL=OrderV1Schema.js.map