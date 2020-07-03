let async = require('async');

import { ConfigParams, IdGenerator, IOpenable, DependencyResolver } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';

import { PaymentV1, OrderV1, PaymentTypesV1, PaymentStatusV1 } from '../data/version1';
import { IPaymentsPersistence } from '../persistence';
import { IPaymentsController } from './IPaymentsController';
import { PaymentsCommandSet } from './PaymentsCommandSet';
import { CompositeLogger, CredentialResolver, CredentialParams } from 'pip-services3-components-node';
import { IPaymentPlatform } from './platforms';
import { PlatformDataV1 } from '../data/version1/PlatformDataV1';
import { OrdersConnector } from './OrdersConnector';

export class PaymentsController implements IPaymentsController, IConfigurable, IOpenable, IReferenceable, ICommandable {
    private _dependencyResolver: DependencyResolver = new DependencyResolver();

    private _persistence: IPaymentsPersistence;
    private _commandSet: PaymentsCommandSet;
    private _logger: CompositeLogger = new CompositeLogger();

    private _paypalPlatform: IPaymentPlatform;
    private _stripePlatform: IPaymentPlatform;
    private _ordersConnector: OrdersConnector;

    public constructor() {
        this._dependencyResolver.put("orders", new Descriptor("pip-services-orders", "client", "*", "*", "1.0"));
    }

    public configure(config: ConfigParams): void {

        this._dependencyResolver.configure(config);
        this._logger.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);

        this._persistence = references.getOneRequired<IPaymentsPersistence>(
            new Descriptor('pip-services-payments', 'persistence', '*', '*', '1.0')
        );

        this._paypalPlatform = references.getOneOptional<IPaymentPlatform>(
            new Descriptor('pip-services-payments', 'platform', 'paypal', '*', '1.0')
        );

        this._stripePlatform = references.getOneOptional<IPaymentPlatform>(
            new Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0')
        );

        let ordersClient: any = this._dependencyResolver.getOneRequired<any>("orders");
        this._ordersConnector = new OrdersConnector(ordersClient);
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null) {
            this._commandSet = new PaymentsCommandSet(this);
        }

        return this._commandSet;
    }
    
    public isOpen(): boolean {
        return this._paypalPlatform != null || this._stripePlatform != null;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        callback(null);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        if (this._paypalPlatform.isOpen) {
            this._paypalPlatform.close(correlationId, (err) => {
                if (err != null) {
                    if (callback) callback(err);
                    return;
                }

                this._paypalPlatform = null;
            });
        }

        if (this._stripePlatform.isOpen) {
            this._stripePlatform.close(correlationId, (err) => {
                if (err != null) {
                    if (callback) callback(err);
                    return;
                }

                this._stripePlatform = null;
            });
        }
    }

    public makeCreditPayment(correlationId: string, platformId: string, orderId: string, methodId: string,
        callback: (err: any, payment: PaymentV1) => void): void {

        //  1. Create new payment object   
        let payment: PaymentV1 = new PaymentV1();
        payment.id = IdGenerator.nextLong();
        payment.order_id = orderId;
        payment.method_id = methodId;
        payment.platform_data = new PlatformDataV1(platformId);
        payment.type = PaymentTypesV1.Credit;
        payment.status = PaymentStatusV1.Created;

        this._persistence.create(correlationId, payment, callback);

        //  2. Get order by id with items list
        var orderV1: OrderV1;
        this._ordersConnector.getOrderById(correlationId, orderId, (err, res) => {
            if (err != null) {
                callback(err, null);
                return;
            }
            orderV1 = res;
        });

        //  3. Create payment and send    
        var platform = this.getPaymentPlatformById(platformId);

        if (platform != null) {
            platform.makeCreditPayment(payment, orderV1, (err) => {
                if (err != null) {
                    callback(err, null);
                    return;
                }
            });
        }

        this._persistence.update(correlationId, payment, callback);
    }

    public confirmCreditPayment(correlationId: string, paymentId: string,
        callback: (err: any, payment: PaymentV1) => void): void {

        let payment: PaymentV1 = this.getPaymentById(correlationId, paymentId, callback);

        if (payment != null) {
            var platform = this.getPaymentPlatformById(payment.platform_data.platform_id);

            if (platform != null) {
                platform.confirmCreditPayment(payment, (err) => {
                    if (err != null) {
                        callback(err, null);
                        return;
                    }
                });
            }
        }

        this._persistence.update(correlationId, payment, callback);
    }

    private getPaymentById(correlationId: string, paymentId: string, callback: (err: any, payment: PaymentV1) => void) {
        let payment: PaymentV1;

        this._persistence.getOneById(correlationId, paymentId, (err: any, item: PaymentV1) => {
            if (err != null)
                callback(err, null);
            else
                payment = item;
        });

        return payment;
    }

    private getPaymentPlatformById(platformId: string): IPaymentPlatform {
        switch (platformId) {
            case 'paypal': return this._paypalPlatform;
            case 'stripe': return this._stripePlatform;
            default: return null;
        }
    }

    public makeDebitPayment(correlationId: string, platformId: string, transactionId: string, destinationAccount: string,
        callback: (err: any, paymentId: string) => void): void {
        callback(null, IdGenerator.nextLong());
    }

    public cancelPayment(correlationId: string, paymentId: string,
        callback: (err: any, res: PaymentV1) => void): void {
        let payment: PaymentV1 = this.getPaymentById(correlationId, paymentId, callback);

        if (payment != null && payment.type == PaymentTypesV1.Credit) {
            var orderV1: OrderV1;
            this._ordersConnector.getOrderById(correlationId, payment.order_id, (err, res) => {
                if (err != null) throw err;
                orderV1 = res;
            });

            var platform = this.getPaymentPlatformById(payment.platform_data.platform_id);

            if (platform != null) {
                platform.cancelCreditPayment(payment, orderV1, (err) => {
                    if (err != null) {
                        callback(err, null);
                        return;
                    }
                });
            }
        }

        this._persistence.update(correlationId, payment, callback);
    }
}