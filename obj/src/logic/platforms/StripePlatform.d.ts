import { IPaymentPlatform } from "./IPaymentPlatform";
import { PaymentV1, OrderV1 } from "../../data/version1";
import { ConfigParams } from "pip-services3-commons-node";
export declare class StripePlatform implements IPaymentPlatform {
    private _credentialsResolver;
    private _credentials;
    private _client;
    private _stripeOptions;
    constructor();
    configure(config: ConfigParams): void;
    isOpen(): boolean;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    makeCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any, response: any) => void): void;
    confirmCreditPayment(payment: PaymentV1, callback: (err: any, response: any) => void): void;
    cancelCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any, result: boolean) => void): void;
}
