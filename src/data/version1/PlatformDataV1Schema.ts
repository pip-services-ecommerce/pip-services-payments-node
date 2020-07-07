import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class PlatformDataV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withOptionalProperty('platform_id', TypeCode.String);
        this.withOptionalProperty('order_id', TypeCode.String);
        this.withOptionalProperty('confirm_data', TypeCode.String);
        this.withOptionalProperty('capture_id', TypeCode.String);
    }
}