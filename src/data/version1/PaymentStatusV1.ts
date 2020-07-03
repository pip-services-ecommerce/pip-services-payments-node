export class PaymentStatusV1 {
    public static Created: string = "created";
    public static Unconfirmed: string = "unconfirmed";
    public static Canceled: string = "canceled";
    public static Authorized: string = "authorized";
    public static Captured: string = "captured";

    public static ErrorCreateOrder: string = "create_order_error";
    public static ErrorCapture: string = "capture_error";
    public static ErrorAuthorize: string = "authorize_error";
    public static ErrorCancel: string = "cancel_error";
}