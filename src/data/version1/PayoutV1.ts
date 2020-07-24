import { IStringIdentifiable } from 'pip-services3-commons-node';

export class PayoutV1 implements IStringIdentifiable {
    public id: string;
    public system: string;
    public status: string;
    
    public status_details?: string;

    public account_id?: string;
    public reversal_id?: string;
}