export class PlatformDataV1
{
    public platform_id: string;

    public order_id: string;
    public order_amount: number;
    public order_currency: string;

    public confirm_data: string;
    public capture_id: string;

    constructor(platform_id: string)
    {
        this.platform_id = platform_id;
    }
}