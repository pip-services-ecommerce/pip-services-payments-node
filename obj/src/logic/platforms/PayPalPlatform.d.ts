import { IPaymentPlatform } from './IPaymentPlatform';
import { OrderV1, PaymentV1 } from '../../data/version1';
import { ConfigParams } from 'pip-services3-commons-node';
export declare class PayPalPlatform implements IPaymentPlatform {
    private _credentialsResolver;
    private _sandbox;
    private _credentials;
    private _client;
    private _checkoutNodeJssdk;
    constructor();
    configure(config: ConfigParams): void;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    makeCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any) => void): void;
    confirmCreditPayment(payment: PaymentV1, callback: (err: any, result: any) => void): void;
    cancelCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any) => void): void;
    private createOrder;
    private captureRefund;
    private authorizeOrder;
    private captureOrder;
    private createPayPalOrder;
    private fromPublic;
}
