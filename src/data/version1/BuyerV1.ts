import { IStringIdentifiable } from 'pip-services3-commons-node';
import { AddressV1 } from './AddressV1';

export class BuyerV1 implements IStringIdentifiable {
    public id: string;
    public name: string;
    public first_name?: string;
    public last_name?: string;
    public email?: string;
    public phone?: string;
    public address?: AddressV1;
}