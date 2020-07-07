let process = require('process');

import { ConfigParams, References, Descriptor } from 'pip-services3-commons-node';

import { PaymentsMongoDbPersistence } from '../../src/persistence';
import { PaymentsPersistenceFixture } from './PaymentsPersistenceFixture';

suite('PaymentsMongoDbPersistence', () => {
    let paymentsPersistence: PaymentsMongoDbPersistence;
    let paymentsFixture: PaymentsPersistenceFixture;

    setup((done) => {
        let mongoUri = process.env['MONGO_SERVICE_URI'];
        let mongoHost = process.env['MONGO_SERVICE_HOST'] || 'localhost';
        let mongoPort = process.env['MONGO_SERVICE_PORT'] || 27017;
        let mongoDatabase = process.env['MONGO_SERVICE_DB'] || 'test';
        let mongoCollectionPayments = process.env['MONGO_COLLECTION_PAYMENTS'] ?? 'payments';
        // Exit if mongo connection is not set
        if (mongoUri == '' && mongoHost == '')
            return;

        var dbConfigPayments = ConfigParams.fromTuples(
            'connection.uri', mongoUri,
            'connection.host', mongoHost,
            'connection.port', mongoPort,
            'connection.database', mongoDatabase,
            'collection', mongoCollectionPayments
        );

        paymentsPersistence = new PaymentsMongoDbPersistence();
        paymentsPersistence.configure(dbConfigPayments);

        paymentsFixture = new PaymentsPersistenceFixture(paymentsPersistence);

        paymentsPersistence.open(null, (err) => {
            if (err) throw err;

            paymentsPersistence.clear(null, (err) => {
                if (err) throw err;
            });

            done();
        });
    });

    teardown((done) => {
        paymentsPersistence.close(null, done);
    });

    test('CRUD Operations', (done) => {
        paymentsFixture.testCrudOperations(done);
    });

    test('Get with Filters', (done) => {
        paymentsFixture.testGetWithFilters(done);
    });

});
