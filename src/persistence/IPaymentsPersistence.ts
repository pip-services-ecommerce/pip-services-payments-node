import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { PaymentV1 } from '..';


export interface IPaymentsPersistence {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<PaymentV1>) => void): void;

    getOneById(correlationId: string, id: string,
        callback: (err: any, item: PaymentV1) => void): void;

    create(correlationId: string, item: PaymentV1,
        callback: (err: any, item: PaymentV1) => void): void;

    update(correlationId: string, item: PaymentV1,
            callback: (err: any, item: PaymentV1) => void): void;
    
    deleteById(correlationId: string, id: string,
        callback: (err: any, item: PaymentV1) => void): void;
}