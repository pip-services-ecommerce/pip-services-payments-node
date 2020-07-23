let async = require('async');

import { ConfigParams, BadRequestException } from 'pip-services3-commons-node';
import { IdGenerator } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';

import { PaymentV1 } from '../data/version1';
import { PaymentSystemV1 } from '../data/version1';
import { PayoutMethodV1 } from '../data/version1';
import { OrderV1 } from '../data/version1';

import { IPaymentsController } from './IPaymentsController';
import { PaymentsCommandSet } from './PaymentsCommandSet';
import { CompositeLogger } from 'pip-services3-components-node';
import { IPaymentsConnector } from './IPaymentsConnector';
import { BuyerV1 } from '../data/version1/BuyerV1';
import { PaymentMethodV1 } from '../data/version1/PaymentMethodV1';
import { PaymentSystemAccountV1 } from '../data/version1/PaymentSystemAccountV1';
import { SellerV1 } from '../data/version1/SellerV1';
import { PayoutV1 } from '../data/version1/PayoutV1';

export class PaymentsController implements IPaymentsController, IConfigurable, IOpenable, IReferenceable, ICommandable {

    private _commandSet: PaymentsCommandSet;
    private _logger: CompositeLogger = new CompositeLogger();

    private _paypalConnector: IPaymentsConnector;
    private _stripeConnector: IPaymentsConnector;

    public constructor() {
    }

    public configure(config: ConfigParams): void {
        this._logger.configure(config);
    }

    public setReferences(references: IReferences): void {

        this._paypalConnector = references.getOneOptional<IPaymentsConnector>(
            new Descriptor('pip-services-payments', 'connector', 'paypal', '*', '1.0')
        );

        this._stripeConnector = references.getOneOptional<IPaymentsConnector>(
            new Descriptor('pip-services-payments', 'connector', 'stripe', '*', '1.0')
        );
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null) {
            this._commandSet = new PaymentsCommandSet(this);
        }

        return this._commandSet;
    }

    public isOpen(): boolean {
        return this._paypalConnector != null || this._stripeConnector != null;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        callback(null);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        if (this._paypalConnector.isOpen) {
            this._paypalConnector.close(correlationId, (err) => {
                if (err != null) {
                    if (callback) callback(err);
                    return;
                }

                this._paypalConnector = null;
            });
        }

        if (this._stripeConnector.isOpen) {
            this._stripeConnector.close(correlationId, (err) => {
                if (err != null) {
                    if (callback) callback(err);
                    return;
                }

                this._stripeConnector = null;
            });
        }
    }

    public makePayment(correlationId: string, system: string, account: PaymentSystemAccountV1,
        buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1,
        amount: number, currencyCode: string,
        callback: (err: any, payment: PaymentV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.makePaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode).then(payment => {
            if (callback) callback(null, payment);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public submitPayment(correlationId: string, system: string, account: PaymentSystemAccountV1,
        buyer: BuyerV1, order: OrderV1, paymentMethod: PaymentMethodV1,
        amount: number, currencyCode: string,
        callback: (err: any, payment: PaymentV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.submitPaymentAsync(correlationId, account, buyer, order, paymentMethod, amount, currencyCode).then(payment => {
            if (callback) callback(null, payment);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public authorizePayment(correlationId: string, system: string, account: PaymentSystemAccountV1,
        payment: PaymentV1,
        callback: (err: any, payment: PaymentV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.authorizePaymentAsync(correlationId, account, payment).then(payment => {
            if (callback) callback(null, payment);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public checkPayment(correlationId: string, system: string, account: PaymentSystemAccountV1,
        payment: PaymentV1,
        callback: (err: any, payment: PaymentV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.checkPaymentAsync(correlationId, account, payment).then(payment => {
            if (callback) callback(null, payment);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public refundPayment(correlationId: string, system: string, account: PaymentSystemAccountV1, payment: PaymentV1,
        callback: (err: any, payment: PaymentV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.refundPaymentAsync(correlationId, account, payment).then(payment => {
            if (callback) callback(null, payment);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public makePayout(correlationId: string, system: string, account: PaymentSystemAccountV1,
        seller: SellerV1, payoutMethod: PayoutMethodV1, description: string, amount: number, currencyCode: string,
        callback: (err: any, payout: PayoutV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.makePayoutAsync(correlationId, account, seller, payoutMethod, description, amount, currencyCode).then(payout => {
            if (callback) callback(null, payout);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public checkPayout(correlationId: string, system: string, account: PaymentSystemAccountV1,
        payout: PayoutV1,
        callback: (err: any, payout: PayoutV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.checkPayoutAsync(correlationId, account, payout).then(payout => {
            if (callback) callback(null, payout);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    public cancelPayout(correlationId: string, system: string, account: PaymentSystemAccountV1,
        payout: PayoutV1,
        callback: (err: any, payout: PayoutV1) => void): void {

        var connector = this.getSystemConnector(correlationId, system, callback);
        if (!connector) return;

        connector.cancelPayoutAsync(correlationId, account, payout).then(payout => {
            if (callback) callback(null, payout);
        }).catch(err => {
            if (callback) callback(err, null);
        });
    }

    private getSystemConnector(correlationId: string, system: string, callback: (err: any, payment: PaymentV1) => void): IPaymentsConnector {
        switch (system) {
            case PaymentSystemV1.PayPal: return this._paypalConnector;
            case PaymentSystemV1.Stripe: return this._stripeConnector;
            default:
        }

        callback(new BadRequestException(correlationId, 'ERR_PAYMENT_SYSTEM', 'Payment system is not supported')
            .withDetails('system', system), null);
        return null;
    }

}