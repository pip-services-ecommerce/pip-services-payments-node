import { IStringIdentifiable } from 'pip-services3-commons-node';
import { CreditCardV1 } from './CreditCardV1';
import { BankAccountV1 } from './BankAccountV1';
import { AddressV1 } from './AddressV1';
import { PayPalAccountV1 } from './PayPalAccountV1';
export declare class PaymentMethodV1 implements IStringIdentifiable {
    id: string;
    type: string;
    card?: CreditCardV1;
    bank_account?: BankAccountV1;
    paypal_account?: PayPalAccountV1;
    stripe_account?: string;
    billing_address?: AddressV1;
}
