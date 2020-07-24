import { IOpenable } from "pip-services3-commons-node";
import { IConfigurable } from "pip-services3-commons-node";
import { OrderV1 } from "../data/version1";
import { PaymentV1 } from "../data/version1";
import { PaymentSystemAccountV1 } from "../data/version1";
import { PaymentMethodV1 } from "../data/version1";
import { BuyerV1 } from "../data/version1";
import { PayoutV1 } from "../data/version1";
import { SellerV1 } from "../data/version1";
export interface IPaymentsConnector extends IOpenable, IConfigurable {
    makePaymentAsync(correlationId: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1, amount: number, currencyCode: string): Promise<PaymentV1>;
    submitPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1, amount: number, currencyCode: string): Promise<PaymentV1>;
    authorizePaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1>;
    checkPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1>;
    refundPaymentAsync(correlationId: string, account: PaymentSystemAccountV1, payment: PaymentV1): Promise<PaymentV1>;
    makePayoutAsync(correlationId: string, account: PaymentSystemAccountV1, seller: SellerV1, description: string, amount: number, currencyCode: string): Promise<PayoutV1>;
    checkPayoutAsync(correlationId: string, account: PaymentSystemAccountV1, payout: PayoutV1): Promise<PayoutV1>;
    cancelPayoutAsync(correlationId: string, account: PaymentSystemAccountV1, payout: PayoutV1): Promise<PayoutV1>;
}
