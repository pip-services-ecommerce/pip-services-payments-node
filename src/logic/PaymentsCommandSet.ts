import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';

import { IPaymentsController } from './IPaymentsController';

export class PaymentsCommandSet extends CommandSet {
    private _controller: IPaymentsController;

    constructor(controller: IPaymentsController) {
        super();

        this._controller = controller;

        this.addCommand(this.makeMakeCreditPaymentCommand());
        this.addCommand(this.makeConfirmCreditPaymentCommand());
        this.addCommand(this.makeMakeDebitPaymentCommand());
        this.addCommand(this.makeCancelPaymentCommand());
    }

    private makeMakeCreditPaymentCommand(): ICommand {
        return new Command(
            'make_credit_payment',
            new ObjectSchema(true)
                .withRequiredProperty('platform_id', TypeCode.String)
                .withRequiredProperty('order_id', TypeCode.String)
                .withOptionalProperty('method_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let platformId = args.getAsString('platform_id');
                let orderId = args.getAsString('order_id');
                let methodId = args.getAsString('method_id');
                this._controller.makeCreditPayment(correlationId, platformId, orderId, methodId, callback);
            }
        );
    }

    private makeConfirmCreditPaymentCommand(): ICommand {
        return new Command(
            'confirm_credit_payment',
            new ObjectSchema(true)
                .withRequiredProperty('payment_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let paymentId = args.getAsString('payment_id');
                this._controller.confirmCreditPayment(correlationId, paymentId, callback);
            }
        );
    }

    private makeMakeDebitPaymentCommand(): ICommand {
        return new Command(
            'make_debit_payment',
            new ObjectSchema(true)
                .withRequiredProperty('platform_id', TypeCode.String)
                .withRequiredProperty('transaction_id', TypeCode.String)
                .withOptionalProperty('destination_account', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let platformId = args.getAsString('platform_id');
                let transactionId = args.getAsString('transaction_id');
                let destinationAccount = args.getAsString('destination_account');
                this._controller.makeDebitPayment(correlationId, platformId, transactionId, destinationAccount, callback);
            }
        );
    }

    private makeCancelPaymentCommand(): ICommand {
        return new Command(
            'cancel_payment',
            new ObjectSchema(true)
                .withRequiredProperty('payment_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let paymentId = args.getAsString('payment_id');
                this._controller.cancelPayment(correlationId, paymentId, callback);
            }
        );
    }
}