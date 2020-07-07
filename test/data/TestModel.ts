
import { IdGenerator, RandomDouble, RandomText, RandomInteger } from "pip-services3-commons-node";
import { OrderV1 } from "../../src/data/version1/OrderV1";
import { OrderItemV1 } from "../../src/data/version1/OrderItemV1";

export class TestModel
{
    static createOrder() : OrderV1
    {
        let order = new OrderV1();
        order.id = IdGenerator.nextLong();
        order.currency_code = 'USD';
        order.items = [];

        let itemsCount = RandomInteger.nextInteger(1, 10); 
        let total = 0;

        for (let index = 0; index < itemsCount; index++) {
            const orderItem = this.createOrderItem(order.currency_code);

            order.items.push(orderItem);
            total += orderItem.amount;
        }

        order.total = total;

        return order;
    }

    static createOrderItem(currency: string) : OrderItemV1
    {
        let orderItem : OrderItemV1 = 
        {
            name: RandomText.word(),
            description: RandomText.phrase(10, 50),
            amount: Math.trunc(RandomDouble.nextDouble(10, 1000) * 100) / 100,
            amount_currency: currency,
            category: RandomText.word(),
            quantity: RandomInteger.nextInteger(1, 10),
        }

        return orderItem;
    }
} 
