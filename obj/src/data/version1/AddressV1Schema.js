"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class AddressV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('line1', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('line2', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('city', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('state', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('postal_code', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('country_code', pip_services3_commons_node_2.TypeCode.String);
    }
}
exports.AddressV1Schema = AddressV1Schema;
//# sourceMappingURL=AddressV1Schema.js.map