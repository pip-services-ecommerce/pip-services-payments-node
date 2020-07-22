import { ObjectSchema, ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class PaymentV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withRequiredProperty('id', TypeCode.String);
        this.withRequiredProperty('system', TypeCode.String);
        this.withRequiredProperty('status', TypeCode.String);

        this.withOptionalProperty('status_details', TypeCode.String);

        this.withOptionalProperty('order_id', TypeCode.String);
        this.withOptionalProperty('order_amount', TypeCode.Float);
        this.withOptionalProperty('order_currency', TypeCode.String);

        this.withOptionalProperty('authorization_id', TypeCode.String);
        
        this.withOptionalProperty('confirm_data', TypeCode.String);
        this.withOptionalProperty('capture_id', TypeCode.String);
    }
}