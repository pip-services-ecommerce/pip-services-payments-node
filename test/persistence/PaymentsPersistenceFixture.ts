let async = require('async');
let assert = require('chai').assert;

import { FilterParams, IdGenerator } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { PaymentV1, PaymentStatusV1, PaymentTypesV1 } from '../../src/data/version1';
import { IPaymentsPersistence } from '../../src/persistence';

var now = new Date();
var lastTime = new Date();
lastTime.setTime(now.getTime() + 1000);

const PAYMENT1: PaymentV1 = {
    id: '1',
    method_id: null,
    order_id: 'order-981273',
    status: PaymentStatusV1.Unconfirmed,
    type: PaymentTypesV1.Credit,
    platform_data: {
        capture_id: 'capture-8978972',
        confirmData: 'http://sandbox.paypal.com/1231',
        order_id: 'order-12312312',
        platform_id: 'paypal'
    }
};

const PAYMENT2: PaymentV1 = {
    id: '2',
    method_id: 'method-897128731',
    order_id: 'order-981273',
    status: PaymentStatusV1.Captured,
    type: PaymentTypesV1.Credit,
    platform_data: {
        capture_id: 'capture-0-89978973',
        confirmData: 'http://sandbox.paypal.com/098123',
        order_id: 'order-7866712',
        platform_id: 'paypal'
    }
};


export class PaymentsPersistenceFixture {
    private _paymentsPersistence: IPaymentsPersistence;

    public constructor(paymentsPersistence: IPaymentsPersistence) {
        assert.isNotNull(paymentsPersistence);
        this._paymentsPersistence = paymentsPersistence;
    }

    private testCreatePayments(done) {
        async.series([
            // Create the first payment
            (callback) => {
                this._paymentsPersistence.create(
                    null,
                    PAYMENT1,
                    (err, payment) => {
                        assert.isNull(err);

                        this.assertEqualPayment(PAYMENT1, payment);

                        callback();
                    }
                );
            },
            // Create the second payment
            (callback) => {
                this._paymentsPersistence.create(
                    null,
                    PAYMENT2,
                    (err, payment) => {
                        assert.isNull(err);

                        this.assertEqualPayment(PAYMENT2, payment);

                        callback();
                    }
                );
            }
        ], done);
    }

    public testCrudOperations(done) {
        let payment1: PaymentV1;

        async.series([
            // Create items
            (callback) => {
                this.testCreatePayments(callback);
            },
            // Get all payments
            (callback) => {
                this._paymentsPersistence.getPageByFilter(
                    null,
                    new FilterParams(),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);

                        payment1 = page.data[0];

                        callback();
                    }
                )
            },
            // Get payment by id
            (callback) => {
                this._paymentsPersistence.getOneById(
                    null,
                    PAYMENT1.id,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        this.assertEqualPayment(payment1, payment);

                        callback();
                    }
                )
            },
            // Delete the payment
            (callback) => {
                this._paymentsPersistence.deleteById(
                    null,
                    PAYMENT1.id,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        this.assertEqualPayment(payment1, payment);

                        callback();
                    }
                )
            },
            // Try to get deleted payment
            (callback) => {
                this._paymentsPersistence.getOneById(
                    null,
                    PAYMENT1.id,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isNull(payment || null);

                        callback();
                    }
                )
            }
        ], done);
    }

    public testGetWithFilters(done) {
        async.series([
            // Create items
            (callback) => {
                this.testCreatePayments(callback);
            },
            // Filter by id
            (callback) => {
                this._paymentsPersistence.getPageByFilter(
                    null,
                    FilterParams.fromTuples(
                        'id', '1'
                    ),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                )
            },
        ], done);
    }

    private assertEqualPayment(expected: PaymentV1, actual: PaymentV1): void {
        assert.isObject(actual);

        assert.equal(expected.id, actual.id);
        assert.equal(expected.method_id, actual.method_id);
        assert.equal(expected.order_id, actual.order_id);
        assert.equal(expected.status, actual.status);
        assert.equal(expected.type, actual.type);

        assert.isObject(expected.platform_data);
        assert.isObject(actual.platform_data);

        assert.equal(expected.platform_data.capture_id, actual.platform_data.capture_id);
        assert.equal(expected.platform_data.confirmData, actual.platform_data.confirmData);
        assert.equal(expected.platform_data.order_id, actual.platform_data.order_id);
        assert.equal(expected.platform_data.platform_id, actual.platform_data.platform_id);
    }
}
