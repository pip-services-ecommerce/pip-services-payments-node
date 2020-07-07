export class PaymentStatusV1 {
    public static Created: string = "created";
    public static Unconfirmed: string = "unconfirmed";
    public static Canceled: string = "canceled";
    public static Authorized: string = "authorized";
    public static Confirmed: string = "confirmed";

    public static ErrorCreateOrder: string = "create_order_error";
    public static ErrorConfirm: string = "confirm_error";
    public static ErrorAuthorize: string = "authorize_error";
    public static ErrorCancel: string = "cancel_error";
}