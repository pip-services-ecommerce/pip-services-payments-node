import { IStringIdentifiable } from 'pip-services3-commons-node';
import { PlatformDataV1 } from './PlatformDataV1';

export class PaymentV1 implements IStringIdentifiable {
    public id: string;
    public order_id: string;
    public method_id?: string;
    public type: string;

    public platform_data: PlatformDataV1;

    public status: string;
}