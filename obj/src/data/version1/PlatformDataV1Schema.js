"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PlatformDataV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withOptionalProperty('platform_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('order_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('confirmData', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('capture_id', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.PlatformDataV1Schema = PlatformDataV1Schema;
//# sourceMappingURL=PlatformDataV1Schema.js.map