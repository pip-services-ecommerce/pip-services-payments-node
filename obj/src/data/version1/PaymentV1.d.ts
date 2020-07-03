import { IStringIdentifiable } from 'pip-services3-commons-node';
import { PlatformDataV1 } from './PlatformDataV1';
export declare class PaymentV1 implements IStringIdentifiable {
    id: string;
    order_id: string;
    method_id?: string;
    type: string;
    platform_data: PlatformDataV1;
    status: string;
}
