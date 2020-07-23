import { IStringIdentifiable } from 'pip-services3-commons-node';

import { CreditCardV1 } from './CreditCardV1';
import { BankAccountV1 } from './BankAccountV1';
import { AddressV1 } from './AddressV1';

export class PayoutMethodV1 implements IStringIdentifiable {
    public id: string;
    public type: string;
    public card?: CreditCardV1;
    public bank_account?: BankAccountV1;
    public billing_address?: AddressV1;
    public token?: string;
}