export declare class OrdersConnector {
    private _ordersClientV1;
    constructor(ordersClientV1: any);
    getOrderById(correlationId: string, id: string, callback: (err: any, res: any) => void): void;
}
