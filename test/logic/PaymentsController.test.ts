let async = require('async');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { PaymentStatusV1, OrderV1, PaymentSystemV1, PaymentV1 } from '../../src/data/version1';
import { PaymentsController } from '../../src/logic/PaymentsController';

import { TestModel } from '../data/TestModel';
import { PayPalConnector } from '../../src/logic/paypal/PayPalConnector';
import { StripeConnector } from '../../src/logic/stripe/StripeConnector';
import { PayoutV1 } from '../../src/data/version1/PayoutV1';

var now = new Date();

suite('PaymentsController', () => {
    let controller: PaymentsController;
    let terminate: boolean = false;
    let STRIPE_ACCESS_KEY: string;

    setup((done) => {
        STRIPE_ACCESS_KEY = process.env["STRIPE_ACCESS_KEY"];

        if (!STRIPE_ACCESS_KEY) {
            terminate = true;
            done(null);
            return;
        }

        controller = new PaymentsController();
        controller.configure(new ConfigParams());

        let stripeConnector = new StripeConnector();
        stripeConnector.configure(ConfigParams.fromTuples(
            'options.auto_confirm', false,
            'credential.access_key', STRIPE_ACCESS_KEY
        ));

        let references = References.fromTuples(
            new Descriptor('pip-services-payments', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-payments', 'connector', 'stripe', '*', '1.0'), stripeConnector
        );

        controller.setReferences(references);

        stripeConnector.open(null, done);
    });

    teardown((done) => {
        if (terminate) {
            done();
            return;
        }

        done();
    });

    test('[Stripe] Make payment', (done) => {
        let order: OrderV1 = TestModel.createOrder();
        let paymentMethodId: string;

        async.series([
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                TestModel.findPaymentMethod(STRIPE_ACCESS_KEY, '2', (err, methodId) =>{
                    assert.isNull(err);
                    assert.isNotNull(methodId);

                    paymentMethodId = methodId;
                    callback(); 
                });
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.makePayment(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    {   // buyer
                        id: '2',
                        name: 'Steve Jobs',
                    },
                    order,
                    {   // payment method
                        id: paymentMethodId,
                        type: 'card'
                    },
                    order.total,
                    order.currency_code,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.isNotNull(payment.capture_id);

                        assert.equal(payment.status, PaymentStatusV1.Confirmed);
                        assert.equal(payment.system, PaymentSystemV1.Stripe);

                        callback();
                    }
                );
            },
        ], done);
    })

    test('[Stripe] Make submit/authorize payment', (done) => {
        let order: OrderV1 = TestModel.createOrder();
        let payment1: PaymentV1;
        let paymentMethodId: string;

        async.series([

            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                TestModel.findPaymentMethod(STRIPE_ACCESS_KEY, '2', (err, methodId) =>{
                    assert.isNull(err);
                    assert.isNotNull(methodId);

                    paymentMethodId = methodId;
                    callback(); 
                });
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.submitPayment(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    {   // buyer
                        id: '2',
                        name: 'Steve Jobs',
                    },
                    order,
                    {   // payment method
                        id: paymentMethodId,
                        type: 'card'
                    },
                    order.total,
                    order.currency_code,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.isNotNull(payment.order_id);

                        assert.equal(payment.status, PaymentStatusV1.Unconfirmed);
                        assert.equal(payment.system, PaymentSystemV1.Stripe);

                        payment1 = payment;
                        callback();
                    }
                );
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.authorizePayment(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    payment1,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.isNotNull(payment.capture_id);

                        assert.equal(payment.status, PaymentStatusV1.Confirmed);
                        assert.equal(payment.system, PaymentSystemV1.Stripe);

                        payment1 = payment;
                        callback();
                    }
                );
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.checkPayment(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    payment1,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.isNotNull(payment.capture_id);

                        assert.equal(payment.status, PaymentStatusV1.Confirmed);
                        assert.equal(payment.system, PaymentSystemV1.Stripe);

                        callback();
                    }
                );
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.refundPayment(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    payment1,
                    (err, payment) => {
                        assert.isNull(err);

                        assert.isObject(payment);
                        assert.isNotNull(payment.id);
                        assert.isNotNull(payment.capture_id);

                        assert.equal(payment.status, PaymentStatusV1.Canceled);
                        assert.equal(payment.system, PaymentSystemV1.Stripe);

                        callback();
                    }
                );
            },
        ], done);
    })

    test('[Stripe] Make/check/cancel payout', (done) => {
        let payout1: PayoutV1;
        async.series([
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.makePayout(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    {   // seller
                        id: '1',
                        name: 'Denis Kuznetsov',
                        first_name: 'Denis',
                        last_name: 'Kuznetsov',
                        email: 'deniskuzn@gmail.com',
                        phone: '2135880065',
                        address: {
                            city: 'Anchorage',
                            country_code: 'US',
                            line1: 'line1',
                            postal_code: '99524',
                            state: 'Alaska'
                        }
                    },
                    'Tests payout',
                    5,
                    'USD',
                    (err, payout) => {
                        if (err) {
                            console.log('make_payout');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(payout);
                        assert.isNotNull(payout.id);
                        assert.isNotNull(payout.account_id);
                        assert.equal(payout.status, PaymentStatusV1.Confirmed);

                        payout1 = payout;
                        callback();
                    }
                );
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.checkPayout(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    payout1,
                    (err, payout) => {
                        if (err) {
                            console.log('check_payout');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(payout);
                        assert.isNotNull(payout.id);
                        assert.isNotNull(payout.account_id);
                        assert.equal(payout.status, PaymentStatusV1.Confirmed);

                        callback();
                    }
                );
            },
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                controller.cancelPayout(
                    null,
                    'stripe',
                    {   // account
                        access_key: STRIPE_ACCESS_KEY
                    },
                    payout1,
                    (err, payout) => {
                        if (err) {
                            console.log('cancel_payout');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(payout);
                        assert.isNotNull(payout.id);
                        assert.isNotNull(payout.account_id);
                        assert.isNotNull(payout.reversal_id);

                        assert.equal(payout.status, PaymentStatusV1.Canceled);
                        assert.equal(payout.system, PaymentSystemV1.Stripe);

                        callback();
                    }
                );
            },
        ], done);
    })

});

