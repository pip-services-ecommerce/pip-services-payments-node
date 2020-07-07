import { OrderItemV1 } from "./OrderItemV1";

export class OrderV1
{
    public id: string;
    public total: number;
    public currency_code: string;

    public items?: OrderItemV1[];
}