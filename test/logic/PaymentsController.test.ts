let async = require('async');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { PaymentV1, PaymentStatusV1, PaymentTypesV1, OrderV1 } from '../../src/data/version1';
import { PaymentsController } from '../../src/logic/PaymentsController';
import { PaymentsMemoryPersistence } from '../../src/persistence';

import { TestModel } from '../data/TestModel';
import { PayPalConnector, StripeConnector } from '../../src/logic/platforms';

var now = new Date();

suite('PaymentsController', () => {
    let paymentsPersistence: PaymentsMemoryPersistence;
    let controller: PaymentsController;
    let terminate: boolean = false;

    setup((done) => {
        var STRIPE_ACCESS_KEY = process.env["STRIPE_ACCESS_KEY"];
        
        if (!STRIPE_ACCESS_KEY)
        {
            terminate = true;
            done(null);
            return;
        }
    
        paymentsPersistence = new PaymentsMemoryPersistence();
        paymentsPersistence.configure(new ConfigParams());

        controller = new PaymentsController();
        controller.configure(new ConfigParams());

        let stripePlatform = new StripeConnector();
        stripePlatform.configure(ConfigParams.fromTuples(
            'options.auto_confirm', false,
            'credential.access_key', STRIPE_ACCESS_KEY
        ));
    
        let references = References.fromTuples(
            new Descriptor('pip-services-payments', 'persistence', 'memory', 'default', '1.0'), paymentsPersistence,
            new Descriptor('pip-services-payments', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-payments', 'platform', 'stripe', '*', '1.0'), stripePlatform
        );

        paymentsPersistence.setReferences(references);
        controller.setReferences(references);

        paymentsPersistence.open(null, (err) =>{
            if (err)
            {
                done(err);
                return;
            }
        
            stripePlatform.open(null, done);
        });
    });

    teardown((done) => {
        if (terminate)
        {
            done();
            return;
        }

        paymentsPersistence.close(null, done);
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

                controller.makeCreditPayment(
                    null,
                    'stripe',
                    '',
                    order,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.isNotNull(payment.platform_data.order_id);        

                        assert.equal(order.id, payment.order_id);
                        assert.equal(PaymentStatusV1.Unconfirmed, payment.status);
                        assert.equal(PaymentTypesV1.Credit, payment.type);
                        assert.equal('stripe', payment.platform_data.platform_id);
                        callback();
                    }
                );
            },
        ], done);
    })
 
});

