export class ShippingDetailsV1 {
    public recipient: string;
    public phone?: string;
    public line1: string;
    public line2?: string;
    public city: string;
    public state?: string;
    public postal_code?: string;
    public country_code: string; // ISO 3166-1
    public instructions?: string;
}