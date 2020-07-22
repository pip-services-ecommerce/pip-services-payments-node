import { IStringIdentifiable } from 'pip-services3-commons-node';

export class PaymentV1 implements IStringIdentifiable {
    public id: string;
    public system: string;
    public status: string;

    public status_details?: string;

    public order_id?: string;
    public order_amount?: number;
    public order_currency?: string;

    public authorization_id?: string;

    public confirm_data?: string;
    public capture_id?: string;
}