import { ConfigParams, References, Descriptor } from 'pip-services3-commons-node';

import { PaymentsMemoryPersistence } from '../../src/persistence';
import { PaymentsPersistenceFixture } from './PaymentsPersistenceFixture';

suite('PaymentsMemoryPersistence', () => {
    let paymentsPersistence: PaymentsMemoryPersistence;
    let fixture: PaymentsPersistenceFixture;

    setup((done) => {
        paymentsPersistence = new PaymentsMemoryPersistence();
        paymentsPersistence.configure(new ConfigParams());

        fixture = new PaymentsPersistenceFixture(paymentsPersistence);

        paymentsPersistence.open(null, done);
    });

    teardown((done) => {
        paymentsPersistence.close(null, done);
    });

    test('CRUD Operations', (done) => {
        fixture.testCrudOperations(done);
    });

    test('Get with Filters', (done) => {
        fixture.testGetWithFilters(done);
    });

});