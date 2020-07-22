import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { AddressV1Schema } from './AddressV1Schema';

export class BuyerV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withRequiredProperty('id', TypeCode.String);
        this.withRequiredProperty('name', TypeCode.String);
        this.withOptionalProperty('first_name', TypeCode.String);
        this.withOptionalProperty('last_name', TypeCode.String);
        this.withOptionalProperty('email', TypeCode.String);
        this.withOptionalProperty('phone', TypeCode.String);
        this.withOptionalProperty('phone', new AddressV1Schema());
    }
}