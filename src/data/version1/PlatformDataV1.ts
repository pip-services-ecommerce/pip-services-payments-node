export class PlatformDataV1
{
    public platform_id: string;
    public order_id: string;
    public confirmData: string;
    public capture_id: string;

    constructor(platform_id: string)
    {
        this.platform_id = platform_id;
    }
}