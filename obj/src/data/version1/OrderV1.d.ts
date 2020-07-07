import { OrderItemV1 } from "./OrderItemV1";
export declare class OrderV1 {
    id: string;
    total: number;
    currency_code: string;
    items?: OrderItemV1[];
}
