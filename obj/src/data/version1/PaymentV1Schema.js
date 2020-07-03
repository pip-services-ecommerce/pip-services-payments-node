"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const PlatformDataV1Schema_1 = require("./PlatformDataV1Schema");
class PaymentV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withOptionalProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('order_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('method_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('type', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('platform_data', new PlatformDataV1Schema_1.PlatformDataV1Schema());
        this.withOptionalProperty('status', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.PaymentV1Schema = PaymentV1Schema;
//# sourceMappingURL=PaymentV1Schema.js.map