import { CommandSet } from 'pip-services3-commons-node';
import { IPaymentsController } from './IPaymentsController';
export declare class PaymentsCommandSet extends CommandSet {
    private _controller;
    constructor(controller: IPaymentsController);
    private makeMakeCreditPaymentCommand;
    private makeConfirmCreditPaymentCommand;
    private makeMakeDebitPaymentCommand;
    private makeCancelPaymentCommand;
}
