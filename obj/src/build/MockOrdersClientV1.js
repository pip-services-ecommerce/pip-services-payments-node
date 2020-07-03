"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockOrdersClientV1 {
    getOrderById(correlationId, id, callback) {
        let order;
        if (id == 'order-12312312')
            order =
                {
                    amount: '100.0',
                    currency_code: 'USD',
                    id: 'order-12312312'
                };
        else if (id == 'order-7866712')
            order =
                {
                    amount: '100.0',
                    currency_code: 'USD',
                    id: 'order-7866712'
                };
        else
            order = null;
        callback(null, order);
    }
}
exports.MockOrdersClientV1 = MockOrdersClientV1;
//# sourceMappingURL=MockOrdersClientV1.js.map