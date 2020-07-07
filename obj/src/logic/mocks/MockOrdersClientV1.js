"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockOrdersClientV1 {
    getOrderById(correlationId, id, callback) {
        let order;
        if (id == 'order-12312312')
            order =
                {
                    total: 100,
                    currency_code: 'USD',
                    customer_id: 'cus_897123',
                    id: 'order-12312312'
                };
        else if (id == 'order-7866712')
            order =
                {
                    total: 100,
                    currency_code: 'USD',
                    customer_id: 'cus_7897324',
                    id: 'order-7866712'
                };
        else
            order = null;
        callback(null, order);
    }
}
exports.MockOrdersClientV1 = MockOrdersClientV1;
//# sourceMappingURL=MockOrdersClientV1.js.map