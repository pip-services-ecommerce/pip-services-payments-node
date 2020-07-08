import { IOpenable, IConfigurable } from "pip-services3-commons-node";
import { OrderV1, PaymentV1 } from "../../data/version1";
export interface IPaymentsConnector extends IOpenable, IConfigurable {
    makeCreditPayment(payment: PaymentV1, order: OrderV1, callback: (err: any) => void): void;
    confirmCreditPayment(payment: PaymentV1, callback: (err: any) => void): void;
    cancelCreditPayment(payment: PaymentV1, callback: (err: any) => void): void;
}
