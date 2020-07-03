import { OrderV1 } from "../..";

export class MockOrdersClientV1 {
    public getOrderById(correlationId: string, id: string, callback: (err: any, res: any) => void): void {
        let order: OrderV1;

        if (id == 'order-12312312')
            order =
            {
                amount: '100.0',
                currency_code: 'USD',
                id: 'order-12312312'
            }
        else if (id == 'order-7866712')
            order =
            {
                amount: '100.0',
                currency_code: 'USD',
                id: 'order-7866712'
            }
        else order = null;

        callback(null, order);
    }
}