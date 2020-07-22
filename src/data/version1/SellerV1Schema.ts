import { ObjectSchema, ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { AddressV1Schema } from './AddressV1Schema';

export class SellerV1Schema extends ObjectSchema {

    public constructor() {
        super();

        this.withRequiredProperty('id', TypeCode.String);
        this.withRequiredProperty('name', TypeCode.String);
        this.withOptionalProperty('first_name', TypeCode.String);
        this.withOptionalProperty('last_name', TypeCode.String);
        this.withOptionalProperty('email', TypeCode.String);
        this.withOptionalProperty('phone', TypeCode.String);
        this.withOptionalProperty('address', new AddressV1Schema());
        this.withOptionalProperty('birth_date', TypeCode.DateTime);
        this.withOptionalProperty('ssn_last4', TypeCode.String);
        this.withOptionalProperty('ip_address', TypeCode.String);
    }
}