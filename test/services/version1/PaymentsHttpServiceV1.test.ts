let async = require('async');
let assert = require('chai').assert;
let restify = require('restify-clients');

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { OrderV1, PaymentSystemV1, PaymentV1 } from '../../../src/data/version1';
import { PaymentStatusV1 } from '../../../src/data/version1';

import { PaymentsController } from '../../../src/logic/PaymentsController';
import { PaymentsHttpServiceV1 } from '../../../src/services/version1/PaymentsHttpServiceV1';
import { TestModel } from '../../data/TestModel';
import { StripeConnector } from '../../../src/logic/stripe/StripeConnector';
import { PayoutV1 } from '../../../src/data/version1/PayoutV1';

var now = new Date();

var httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('PaymentsHttpServiceV1', () => {
    let controller: PaymentsController;
    let service: PaymentsHttpServiceV1;
    let rest: any;
    let terminate: boolean = false;
    let STRIPE_ACCESS_KEY: string = null;

    setup((done) => {
        STRIPE_ACCESS_KEY = process.env["STRIPE_ACCESS_KEY"];

        if (!STRIPE_ACCESS_KEY) {
            terminate = true;
            done(null);
            return;
        }

        let url = "http://localhost:3000";
        rest = restify.createJsonClient({ url: url, version: '*' });

        controller = new PaymentsController();
        controller.configure(new ConfigParams());

        let stripeConnector = new StripeConnector();
        stripeConnector.configure(ConfigParams.fromTuples(
            'options.auto_confirm', false,
            'credential.access_key', STRIPE_ACCESS_KEY
        ));

        service = new PaymentsHttpServiceV1();
        service.configure(httpConfig);

        let references = References.fromTuples(
            new Descriptor('pip-services-payments', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-payments', 'service', 'http', 'default', '1.0'), service,
            new Descriptor('pip-services-payments', 'connector', 'stripe', '*', '1.0'), stripeConnector
        );

        controller.setReferences(references);
        service.setReferences(references);

        stripeConnector.open(null, null);
        service.open(null, done);
    });

    teardown((done) => {
        if (terminate) {
            done();
            return;
        }

        service.close(null, done);
    });

    test('[Stripe] Make/refund payment', (done) => {
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

                rest.post('/v1/payments/make_payment',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        buyer: {
                            id: '2',
                            name: 'Steve Jobs',
                        },
                        order: order,
                        payment_method: {
                            id: paymentMethodId,
                            type: 'card'
                        },
                        amount: order.total,
                        currency_code: order.currency_code,
                    },
                    (err, req, res, payment) => {
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

                rest.post('/v1/payments/refund_payment',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        payment: payment1,
                    },
                    (err, req, res, payment) => {
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
    });

    test('[Stripe] Submit/authorize/check/refund payment', (done) => {
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

                rest.post('/v1/payments/submit_payment',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        buyer: {
                            id: '2',
                            name: 'Steve Jobs',
                        },
                        order: order,
                        payment_method: {
                            id: paymentMethodId,
                            type: 'card'
                        },
                        amount: order.total,
                        currency_code: order.currency_code,
                    },
                    (err, req, res, payment) => {
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

                rest.post('/v1/payments/authorize_payment',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        payment: payment1,
                    },
                    (err, req, res, payment) => {
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

                rest.post('/v1/payments/check_payment',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        payment: payment1,
                    },
                    (err, req, res, payment) => {
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

                rest.post('/v1/payments/refund_payment',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        payment: payment1,
                    },
                    (err, req, res, payment) => {
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
    });

    test('[Stripe] Make/check/cancel payout', (done) => {
        let payout1: PayoutV1;

        async.series([
            (callback) => {
                if (terminate) {
                    callback();
                    return;
                }

                rest.post('/v1/payments/make_payout',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        seller: {
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
                            },
                            birth_date: new Date(1980, 4, 8),
                            ssn_last4: '7682',
                            ip_address: '216.67.35.82'
                        },
                        description: 'Tests payout',
                        amount: 5,
                        currency_code: 'USD',
                    },
                    (err, req, res, payout) => {

                        if (err) {
                            console.log('make_payout');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(payout);
                        assert.isNotNull(payout.id);
                        assert.isNotNull(payout.transfer_id);
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

                rest.post('/v1/payments/check_payout',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        payout: payout1,
                    },
                    (err, req, res, payout) => {
                        if (err) {
                            console.log('check_payout');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(payout);
                        assert.isNotNull(payout.id);
                        assert.isNotNull(payout.transfer_id);
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

                rest.post('/v1/payments/cancel_payout',
                    {
                        system: 'stripe',
                        account: {
                            access_key: STRIPE_ACCESS_KEY
                        },
                        payout: payout1,
                    },
                    (err, req, res, payout) => {
                        if (err) {
                            console.log('cancel_payout');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(payout);
                        assert.isNotNull(payout.id);
                        assert.isNotNull(payout.transfer_id);
                        assert.isNotNull(payout.account_id);

                        assert.equal(payout.status, PaymentStatusV1.Canceled);
                        assert.equal(payout.system, PaymentSystemV1.Stripe);

                        callback();
                    }
                );
            },
        ], done);
    });

});