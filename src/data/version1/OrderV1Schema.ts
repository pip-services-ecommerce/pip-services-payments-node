import { ObjectSchema, ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { OrderItemV1Schema } from './OrderItemV1Schema';

export class OrderV1Schema extends ObjectSchema {

    public constructor() {
        super();
        
        this.withRequiredProperty('id', TypeCode.String);
        this.withOptionalProperty('number', TypeCode.String);
        this.withOptionalProperty('currency_code', TypeCode.String);

        this.withOptionalProperty('shipping_details', null);
        this.withOptionalProperty('items', new ArraySchema(new OrderItemV1Schema()));

        this.withOptionalProperty('subtotal', TypeCode.Float);
        this.withOptionalProperty('discount', TypeCode.Float);
        this.withOptionalProperty('discount_code', TypeCode.String);
        this.withOptionalProperty('shipping_cost', TypeCode.Float);
        this.withOptionalProperty('tax_percent', TypeCode.Float);
        this.withOptionalProperty('tax', TypeCode.Float);
        this.withOptionalProperty('other_cost', TypeCode.Float);
        this.withOptionalProperty('total', TypeCode.Float);
    }
}