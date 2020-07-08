import { OrderItemV1 } from "./OrderItemV1";
import { ShippingDetailsV1 } from "./ShippingDetailsV1";

export class OrderV1 {
    public id: string;
    public number?: string;
    public currency_code: string;

    public shipping_details?: ShippingDetailsV1;
    public items?: OrderItemV1[];

    public subtotal?: number;
    public discount?: number;
    public discount_code?: string;
    public shipping_cost?: number;
    public tax_percent?: number;
    public tax?: number;
    public other_cost?: number;
    public total: number;
}