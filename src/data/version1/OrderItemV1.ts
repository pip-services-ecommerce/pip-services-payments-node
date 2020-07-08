export class OrderItemV1 {
    public product_id: string;
    public product_name: string;
    public description?: string;
    public quantity: number;
    public price: number;
    public discount?: number;
    public discount_price?: number;
    public total: number;
}