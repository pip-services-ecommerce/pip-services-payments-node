import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';

import { IPaymentsController } from './IPaymentsController';
import { OrderV1Schema, PaymentV1Schema, PayoutMethodV1, PayoutMethodV1Schema } from '../data/version1';
import { PaymentSystemAccountV1Schema } from '../data/version1/PaymentSystemAccountV1Schema';
import { BuyerV1Schema } from '../data/version1/BuyerV1Schema';
import { PaymentMethodV1Schema } from '../data/version1/PaymentMethodV1Schema';
import { PayoutV1Schema } from '../data/version1/PayoutV1Schema';
import { SellerV1Schema } from '../data/version1/SellerV1Schema';

export class PaymentsCommandSet extends CommandSet {
    private _controller: IPaymentsController;

    constructor(controller: IPaymentsController) {
        super();

        this._controller = controller;

        this.addCommand(this.makeMakePaymentCommand());
        this.addCommand(this.makeSubmitPaymentCommand());
        this.addCommand(this.makeAuthorizePaymentCommand());
        this.addCommand(this.makeCheckPaymentCommand());
        this.addCommand(this.makeRefundPaymentCommand());

        this.addCommand(this.makeMakePayoutCommand());
        this.addCommand(this.makeCheckPayoutCommand());
        this.addCommand(this.makeCancelPayoutCommand());
    }

    private makeMakePaymentCommand(): ICommand {
        return new Command(
            'make_payment',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withRequiredProperty('buyer', new BuyerV1Schema())
                .withOptionalProperty('order', new OrderV1Schema())
                .withOptionalProperty('payment_method', new PaymentMethodV1Schema())
                .withOptionalProperty('amount', TypeCode.Float)
                .withOptionalProperty('currency_code', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let buyer = args.getAsObject('buyer');
                let order = args.getAsObject('order');
                let paymentMethod = args.getAsObject('payment_method');
                let amount = args.getAsNullableFloat('amount');
                let currencyCode = args.getAsNullableString('currency_code');

                this._controller.makePayment(correlationId, system, account, buyer, order,
                    paymentMethod, amount, currencyCode, callback);
            }
        );
    }

    private makeSubmitPaymentCommand(): ICommand {
        return new Command(
            'submit_payment',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withRequiredProperty('buyer', new BuyerV1Schema())
                .withOptionalProperty('order', new OrderV1Schema())
                .withOptionalProperty('payment_method', new PaymentMethodV1Schema())
                .withOptionalProperty('amount', TypeCode.Float)
                .withOptionalProperty('currency_code', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let buyer = args.getAsObject('buyer');
                let order = args.getAsObject('order');
                let paymentMethod = args.getAsObject('payment_method');
                let amount = args.getAsNullableFloat('amount');
                let currencyCode = args.getAsNullableString('currency_code');

                this._controller.submitPayment(correlationId, system, account, buyer, order,
                    paymentMethod, amount, currencyCode, callback);
            }
        );
    }

    private makeAuthorizePaymentCommand(): ICommand {
        return new Command(
            'authorize_payment',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withOptionalProperty('payment', new PaymentV1Schema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let payment = args.getAsObject('payment');

                this._controller.authorizePayment(correlationId, system, account, payment, callback);
            }
        );
    }

    private makeCheckPaymentCommand(): ICommand {
        return new Command(
            'check_payment',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withOptionalProperty('payment', new PaymentV1Schema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let payment = args.getAsObject('payment');

                this._controller.checkPayment(correlationId, system, account, payment, callback);
            }
        );
    }

    private makeRefundPaymentCommand(): ICommand {
        return new Command(
            'refund_payment',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withOptionalProperty('payment', new PaymentV1Schema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let payment = args.getAsObject('payment');

                this._controller.refundPayment(correlationId, system, account, payment, callback);
            }
        );
    }

    private makeMakePayoutCommand(): ICommand {
        return new Command(
            'make_payout',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withRequiredProperty('seller', new SellerV1Schema())
                .withOptionalProperty('payout_method', new PayoutMethodV1Schema())
                .withOptionalProperty('description', TypeCode.String)
                .withRequiredProperty('amount', TypeCode.Float)
                .withRequiredProperty('currency_code', TypeCode.String),

            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let seller = args.getAsObject('seller');
                let payoutMethod = args.getAsObject('payout_method');
                let description = args.getAsNullableString('description');
                let amount = args.getAsFloat('amount');
                let currencyCode = args.getAsString('currency_code');

                this._controller.makePayout(correlationId, system, account, seller, payoutMethod, description,
                    amount, currencyCode, callback);
            }
        );
    }

    private makeCheckPayoutCommand(): ICommand {
        return new Command(
            'check_payout',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withRequiredProperty('payout', new PayoutV1Schema()),

            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let payout = args.getAsObject('payout');

                this._controller.checkPayout(correlationId, system, account, payout, callback);
            }
        );
    }

    private makeCancelPayoutCommand(): ICommand {
        return new Command(
            'cancel_payout',
            new ObjectSchema(true)
                .withRequiredProperty('system', TypeCode.String)
                .withRequiredProperty('account', new PaymentSystemAccountV1Schema())
                .withRequiredProperty('payout', new PayoutV1Schema()),

            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let system = args.getAsString('system');
                let account = args.getAsObject('account');
                let payout = args.getAsObject('payout');

                this._controller.cancelPayout(correlationId, system, account, payout, callback);
            }
        );
    }
}