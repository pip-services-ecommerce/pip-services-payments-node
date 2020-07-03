class PayPalOrder
{
    public id?: string;
    public create_time?: Date;

    public intent: string;
    public application_context: ApplicationContext;
    public purchase_units: PurchaseUnit[];
}

class ApplicationContext
{
    public return_url?: string;
    public cancel_url?: string;
    public brand_name?: string;
    public locale?: string;
    public user_action?: string;
}

class PurchaseUnit
{
    public amount: AmountWithBreakdown;
    public items: Item[];
}

class AmountWithBreakdown
{
    public currency_code: string;
    public value: string;
    public breakdown?: AmountBreakdown;
}

class AmountBreakdown
{
}

class Item
{
    public name: string;
    public description: string;
    public unit_amount: Money;
    public tax: Money;
    public quantity: string;
    public category: string;
}

class Money
{
    public currency_code: string;
    public value: string;
}