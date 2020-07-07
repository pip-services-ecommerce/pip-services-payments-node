export class OrderItemV1
{
    public name: string;
    public description?: string;
    
    public amount: number;
    public amount_currency: string;

    public tax?: number;
    public tax_currency?: string;

    public quantity: number;
    public category?: string;
}