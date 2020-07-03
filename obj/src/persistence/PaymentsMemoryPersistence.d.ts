import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';
import { PaymentV1 } from '../data/version1';
import { IPaymentsPersistence } from './IPaymentsPersistence';
export declare class PaymentsMemoryPersistence extends IdentifiableMemoryPersistence<PaymentV1, string> implements IPaymentsPersistence {
    constructor();
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<PaymentV1>) => void): void;
}
