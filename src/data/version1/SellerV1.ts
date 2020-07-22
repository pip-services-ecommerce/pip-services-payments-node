import { IStringIdentifiable } from 'pip-services3-commons-node';
import { AddressV1 } from './AddressV1';

export class SellerV1 implements IStringIdentifiable {
    public id: string;
    public name: string;
    public first_name?: string;
    public last_name?: string;
    public email?: string;
    public phone?: string;
    public address?: AddressV1;

    public birth_date?: Date;
    public ssn_last4?: string;
    public ip_address?: string;
}