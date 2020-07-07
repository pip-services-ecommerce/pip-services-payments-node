import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class OrderItemV1Schema extends ObjectSchema {

    public constructor() {
        super();
    
        this.withRequiredProperty('name', TypeCode.String);
        this.withOptionalProperty('description', TypeCode.String);
        this.withRequiredProperty('amount', TypeCode.Float);
        this.withRequiredProperty('amount_currency', TypeCode.String);
        this.withOptionalProperty('tax', TypeCode.Float);
        this.withOptionalProperty('tax_currency', TypeCode.String);
        this.withRequiredProperty('quantity', TypeCode.Float);
        this.withOptionalProperty('category', TypeCode.String);
    }
}