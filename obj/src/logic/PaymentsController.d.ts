import { ConfigParams } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { PaymentV1 } from '../data/version1';
import { PayoutMethodV1 } from '../data/version1';
import { OrderV1 } from '../data/version1';
import { IPaymentsController } from './IPaymentsController';
import { BuyerV1 } from '../data/version1/BuyerV1';
import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { PaymentSystemAccountV1 } from '../data/version1/PaymentSystemAccountV1';
import { SellerV1 } from '../data/version1/SellerV1';
import { PayoutV1 } from '../data/version1/PayoutV1';
export declare class PaymentsController implements IPaymentsController, IConfigurable, IOpenable, IReferenceable, ICommandable {
    private _commandSet;
    private _logger;
    private _paypalConnector;
    private _stripeConnector;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    makePayment(correlationId: string, system: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1, amount: number, currencyCode: string, callback: (err: any, payment: PaymentV1) => void): void;
    submitPayment(correlationId: string, system: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1, amount: number, currencyCode: string, callback: (err: any, payment: PaymentV1) => void): void;
    authorizePayment(correlationId: string, system: string, account: PaymentSystemAccountV1, payment: PaymentV1, callback: (err: any, payment: PaymentV1) => void): void;
    checkPayment(correlationId: string, system: string, account: PaymentSystemAccountV1, payment: PaymentV1, callback: (err: any, payment: PaymentV1) => void): void;
    refundPayment(correlationId: string, system: string, account: PaymentSystemAccountV1, payment: PaymentV1, callback: (err: any, payment: PaymentV1) => void): void;
    makePayout(correlationId: string, system: string, account: PaymentSystemAccountV1, seller: SellerV1, payoutMethod: PayoutMethodV1, description: string, amount: number, currencyCode: string, callback: (err: any, payout: PayoutV1) => void): void;
    checkPayout(correlationId: string, system: string, account: PaymentSystemAccountV1, payout: PayoutV1, callback: (err: any, payout: PayoutV1) => void): void;
    cancelPayout(correlationId: string, system: string, account: PaymentSystemAccountV1, payout: PayoutV1, callback: (err: any, payout: PayoutV1) => void): void;
    private getSystemConnector;
}
