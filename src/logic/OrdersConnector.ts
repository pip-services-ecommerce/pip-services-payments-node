export class OrdersConnector {
    private _ordersClientV1: any;

    constructor(ordersClientV1: any) {
        this._ordersClientV1 = ordersClientV1;
    }

    getOrderById(correlationId: string, id: string, callback: (err: any, res: any) => void): void {
        if (this._ordersClientV1 == null)
        {
            callback(null, null);
            return;
        }

        this._ordersClientV1.getOrderById(correlationId, id, callback);
    }
}