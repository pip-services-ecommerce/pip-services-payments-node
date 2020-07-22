"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PaymentMethodV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('type', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('card', null);
        this.withOptionalProperty('bank_account', null);
        this.withOptionalProperty('paypal_account', null);
        this.withOptionalProperty('stripe_account', null);
        this.withOptionalProperty('billing_address', null);
    }
}
exports.PaymentMethodV1Schema = PaymentMethodV1Schema;
//# sourceMappingURL=PaymentMethodV1Schema.js.map