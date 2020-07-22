import { Money } from "./Money";

export class AmountBreakdown {
    public item_total?: Money;
    public shipping?: Money;
    public handling?: Money;
    public tax_total?: Money;
    public shipping_discount?: Money;
}