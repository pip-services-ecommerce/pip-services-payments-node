import { ConfigParams, IOpenable } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { PaymentV1, OrderV1 } from '../data/version1';
import { IPaymentsController } from './IPaymentsController';
export declare class PaymentsController implements IPaymentsController, IConfigurable, IOpenable, IReferenceable, ICommandable {
    private _persistence;
    private _commandSet;
    private _logger;
    private _paypalPlatform;
    private _stripePlatform;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    makeCreditPayment(correlationId: string, platformId: string, methodId: string, order: OrderV1, callback: (err: any, payment: PaymentV1) => void): void;
    confirmCreditPayment(correlationId: string, paymentId: string, callback: (err: any, payment: PaymentV1) => void): void;
    private getPaymentById;
    private getPaymentPlatformById;
    makeDebitPayment(correlationId: string, platformId: string, transactionId: string, destinationAccount: string, callback: (err: any, payment: PaymentV1) => void): void;
    cancelPayment(correlationId: string, paymentId: string, callback: (err: any, res: PaymentV1) => void): void;
}
