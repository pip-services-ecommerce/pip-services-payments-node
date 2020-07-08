import { IStringIdentifiable } from 'pip-services3-commons-node';
import { PlatformDataV1 } from './PlatformDataV1';

export class PaymentV1 implements IStringIdentifiable {
    public id: string;
    public system: string;
    public status: string;

    // public platform_data: PlatformDataV1;
    // Todo: Add platform specific data here that allows to perform other operations
}