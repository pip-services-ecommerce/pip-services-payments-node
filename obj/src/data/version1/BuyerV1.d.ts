import { IStringIdentifiable } from 'pip-services3-commons-node';
import { AddressV1 } from './AddressV1';
export declare class BuyerV1 implements IStringIdentifiable {
    id: string;
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: AddressV1;
}
