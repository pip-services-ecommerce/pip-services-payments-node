import { IStringIdentifiable } from 'pip-services3-commons-node';
export declare class PayoutV1 implements IStringIdentifiable {
    id: string;
    system: string;
    status: string;
    status_details?: string;
    account_id?: string;
    reversal_id?: string;
}
