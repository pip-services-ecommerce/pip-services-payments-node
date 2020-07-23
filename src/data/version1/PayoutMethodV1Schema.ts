import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class PayoutMethodV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withRequiredProperty('id', TypeCode.String);
        this.withOptionalProperty('type', TypeCode.String);
        this.withOptionalProperty('card', null);
        this.withOptionalProperty('bank_account', null);
        this.withOptionalProperty('billing_address', null);
        this.withOptionalProperty('token', TypeCode.String);
    }
}