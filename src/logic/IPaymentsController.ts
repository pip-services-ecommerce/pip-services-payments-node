import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { OrderV1, PaymentV1 } from '../data/version1';

export interface IPaymentsController {
    makeCreditPayment(correlationId: string, platformId: string, methodId: string, order: OrderV1,
        callback: (err: any, payment: PaymentV1) => void): void;

    confirmCreditPayment(correlationId: string, paymentId: string, 
        callback: (err: any, payment: PaymentV1) => void): void;

    makeDebitPayment(correlationId: string, platformId: string, transactionId: string, destinationAccount: string,
        callback: (err: any, payment: PaymentV1) => void): void;

    cancelPayment(correlationId: string, paymentId: string,
        callback: (err: any, payment: PaymentV1) => void): void;

}