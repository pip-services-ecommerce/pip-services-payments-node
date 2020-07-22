import { AmountBreakdown } from "./AmountBreakdown";

export class AmountWithBreakdown {
    public currency_code: string;
    public value: string;
    public breakdown?: AmountBreakdown;
}