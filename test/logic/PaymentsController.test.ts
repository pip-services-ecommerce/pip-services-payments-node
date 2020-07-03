let async = require('async');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { PaymentV1, PaymentStatusV1, PaymentTypesV1 } from '../../src/data/version1';
import { PaymentsController } from '../../src/logic/PaymentsController';
import { PaymentsMemoryPersistence } from '../../src/persistence';

import { MockOrdersClientV1 } from '../../src/build';

var now = new Date();

suite('PaymentsController', () => {
    let paymentsPersistence: PaymentsMemoryPersistence;
    let controller: PaymentsController;

    setup((done) => {
        paymentsPersistence = new PaymentsMemoryPersistence();
        paymentsPersistence.configure(new ConfigParams());

        controller = new PaymentsController();
        controller.configure(new ConfigParams());

        let ordersClient = new MockOrdersClientV1();
        let references = References.fromTuples(
            new Descriptor('pip-services-payments', 'persistence', 'memory', 'default', '1.0'), paymentsPersistence,
            new Descriptor('pip-services-payments', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-orders', 'client', '*', '*', '1.0'), ordersClient
        );

        paymentsPersistence.setReferences(references);
        controller.setReferences(references);

        paymentsPersistence.open(null, done);
    });

    teardown((done) => {
        paymentsPersistence.close(null, done);
    });

    test('Make credit payment', (done) => {
        let practice1: PaymentV1;

        async.series([
            // Create the first practice
            (callback) => {
                controller.makeCreditPayment(
                    null,
                    'paypal',
                    'order-12312312',
                    null,
                    (err, practice) => {
                        assert.isNull(err);

                        assert.isObject(practice);
                        assert.isNotNull(practice.id);
                        assert.equal('order-12312312', practice.order_id);
                        assert.equal(PaymentStatusV1.Unconfirmed, practice.status);
                        assert.equal(PaymentTypesV1.Credit, practice.type);

                        callback();
                    }
                );
            },
        ]);
    })
});