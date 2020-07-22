import { Money } from "./Money";

export class Item {
    public name: string;
    public description: string;
    public unit_amount: Money;
    public tax: Money;
    public quantity: string;
    public category: string;
}
