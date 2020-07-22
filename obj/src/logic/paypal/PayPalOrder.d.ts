import { PurchaseUnit } from './PurchaseUnit';
import { ApplicationContext } from './ApplicationContext';
export declare class PayPalOrder {
    id?: string;
    create_time?: Date;
    intent: string;
    application_context: ApplicationContext;
    purchase_units: PurchaseUnit[];
}
