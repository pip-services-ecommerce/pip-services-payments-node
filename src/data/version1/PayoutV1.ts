import { IStringIdentifiable } from 'pip-services3-commons-node';

export class PayoutV1 implements IStringIdentifiable {
    public id: string;
    public system: string;
    public status: string;

    // Todo: Add platform specific data here that allows to perform other operations
}