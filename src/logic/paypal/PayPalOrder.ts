import { PurchaseUnit } from './PurchaseUnit';
import { ApplicationContext } from './ApplicationContext';

export class PayPalOrder {
    public id?: string;
    public create_time?: Date;

    public intent: string;
    public application_context: ApplicationContext;
    public purchase_units: PurchaseUnit[];
}




