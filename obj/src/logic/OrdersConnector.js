"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OrdersConnector {
    constructor(ordersClientV1) {
        this._ordersClientV1 = ordersClientV1;
    }
    getOrderById(correlationId, id, callback) {
        if (this._ordersClientV1 == null) {
            callback(null, null);
            return;
        }
        this._ordersClientV1.getOrderById(correlationId, id, callback);
    }
}
exports.OrdersConnector = OrdersConnector;
//# sourceMappingURL=OrdersConnector.js.map