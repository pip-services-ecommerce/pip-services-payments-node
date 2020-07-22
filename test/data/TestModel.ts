
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
            const orderItem = this.createOrderItem();

            order.items.push(orderItem);
            total += orderItem.total;
        }

        order.total = total;

        return order;
    }

    static createOrderItem() : OrderItemV1
    {
        let quantity = RandomInteger.nextInteger(1, 5);
        let price = Math.round(RandomDouble.nextDouble(5, 30) * 100) / 100;
        let total = quantity * price;

        let orderItem : OrderItemV1 = 
        {
            product_id: IdGenerator.nextLong(),
            product_name: RandomText.word(),
            description: RandomText.phrase(10, 50),
            quantity: quantity,
            price: price,
            total: total
        }

        return orderItem;
    }
} 
