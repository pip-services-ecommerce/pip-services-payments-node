declare class PayPalOrder {
    id?: string;
    create_time?: Date;
    intent: string;
    application_context: ApplicationContext;
    purchase_units: PurchaseUnit[];
}
declare class ApplicationContext {
    return_url?: string;
    cancel_url?: string;
    brand_name?: string;
    locale?: string;
    user_action?: string;
}
declare class PurchaseUnit {
    amount: AmountWithBreakdown;
    items: Item[];
}
declare class AmountWithBreakdown {
    currency_code: string;
    value: string;
    breakdown?: AmountBreakdown;
}
declare class AmountBreakdown {
}
declare class Item {
    name: string;
    description: string;
    unit_amount: Money;
    tax: Money;
    quantity: string;
    category: string;
}
declare class Money {
    currency_code: string;
    value: string;
}
