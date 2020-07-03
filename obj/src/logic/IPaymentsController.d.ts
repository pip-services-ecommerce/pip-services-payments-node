import { PaymentV1 } from '../data/version1';
export interface IPaymentsController {
    makeCreditPayment(correlationId: string, platformId: string, orderId: string, methodId: string, callback: (err: any, payment: PaymentV1) => void): void;
    confirmCreditPayment(correlationId: string, paymentId: string, callback: (err: any, payment: PaymentV1) => void): void;
    makeDebitPayment(correlationId: string, platformId: string, transactionId: string, destinationAccount: string, callback: (err: any, paymentId: string) => void): void;
    cancelPayment(correlationId: string, paymentId: string, callback: (err: any, payment: PaymentV1) => void): void;
}
