import { ObjectSchema, ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { OrderItemV1Schema } from './OrderItemV1Schema';

export class OrderV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withOptionalProperty('total', TypeCode.Float);
        this.withOptionalProperty('currency_code', TypeCode.String);
        this.withOptionalProperty('items', new ArraySchema(new OrderItemV1Schema()));
    }
}