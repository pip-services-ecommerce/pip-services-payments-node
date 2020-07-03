import { ObjectSchema, ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { PlatformDataV1Schema } from './PlatformDataV1Schema';

export class PaymentV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withOptionalProperty('id', TypeCode.String);
        this.withOptionalProperty('order_id', TypeCode.String);
        this.withOptionalProperty('method_id', TypeCode.String);
        this.withOptionalProperty('type', TypeCode.String);
        this.withOptionalProperty('platform_data', new PlatformDataV1Schema());
        this.withOptionalProperty('status', TypeCode.String);
    }
}