let async = require('async');
let assert = require('chai').assert;
let restify = require('restify-clients');

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { OrderV1, PaymentStatusV1, PaymentTypesV1 } from '../../../src/data/version1';
import { PaymentsMemoryPersistence } from '../../../src/persistence';
import { PaymentsController } from '../../../src/logic/PaymentsController';
import { PaymentsHttpServiceV1 } from '../../../src/services/version1/PaymentsHttpServiceV1';
import { TestModel } from '../../data/TestModel';
import { StripeConnector } from '../../../src/logic/platforms';

var now = new Date();

var httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('PaymentsHttpServiceV1', () => {
    let paymentsPersistence: PaymentsMemoryPersistence;
    let controller: PaymentsController;
    let service: PaymentsHttpServiceV1;
    let rest: any;
    let terminate: boolean = false;

    setup((done) => {
        var STRIPE_ACCESS_KEY = process.env["STRIPE_ACCESS_KEY"];
        
        if (!STRIPE_ACCESS_KEY)
        {
            terminate = true;
            done(null);
            return;
        }

        let url = "http://localhost:3000";
        rest = restify.createJsonClient({ url: url, version: '*' });

        paymentsPersistence = new PaymentsMemoryPersistence();
        paymentsPersistence.configure(new ConfigParams());

        controller = new PaymentsController();
        controller.configure(new ConfigParams());

        let stripePlatform = new StripeConnector();
        stripePlatform.configure(ConfigParams.fromTuples(
            'options.auto_confirm', false,
            'credential.access_key', STRIPE_ACCESS_KEY
        ));
        
        service = new PaymentsHttpServiceV1();
        service.configure(httpConfig);

        let references = References.fromTuples(
            new Descriptor('pip-services-payments', 'persistence', 'memory', 'default', '1.0'), paymentsPersistence,
            new Descriptor('pip-services-payments', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-payments', 'service', 'http', 'default', '1.0'), service,
            new Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0'), stripePlatform
        );

        paymentsPersistence.setReferences(references);
        controller.setReferences(references);
        service.setReferences(references);

        paymentsPersistence.open(null, null);
        stripePlatform.open(null, null);
        service.open(null, done);
    });

    teardown((done) => {
        if (terminate)
        {
            done();
            return;
        }

        service.close(null, (err) => {
            paymentsPersistence.close(null, done);
        });
    });

    test('Make credit payment', (done) => {
        let order: OrderV1 = TestModel.createOrder();

        async.series([
            (callback) => {
                if (terminate)
                {
                    callback();
                    return;
                }

                rest.post('/v1/payments/make_credit_payment',
                    {
                        platform_id: 'stripe',
                        method_id: 'md-0971289731',
                        order: order
                    },
                    (err, req, res, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.equal(order.id, payment.order_id);
                        assert.equal(PaymentStatusV1.Unconfirmed, payment.status);
                        assert.equal(PaymentTypesV1.Credit, payment.type);

                        callback();
                    }
                );
            },
        ], done);
    });
});