import { IStringIdentifiable } from 'pip-services3-commons-node';
import { CreditCardV1 } from './CreditCardV1';
import { BankAccountV1 } from './BankAccountV1';
import { AddressV1 } from './AddressV1';
export declare class PayoutMethodV1 implements IStringIdentifiable {
    id: string;
    type: string;
    card?: CreditCardV1;
    bank_account?: BankAccountV1;
    billing_address?: AddressV1;
    token?: string;
}
