import { OrderItemV1 } from "./OrderItemV1";
import { ShippingDetailsV1 } from "./ShippingDetailsV1";
export declare class OrderV1 {
    id: string;
    number?: string;
    currency_code: string;
    shipping_details?: ShippingDetailsV1;
    items?: OrderItemV1[];
    subtotal?: number;
    discount?: number;
    discount_code?: string;
    shipping_cost?: number;
    tax_percent?: number;
    tax?: number;
    other_cost?: number;
    total: number;
}
