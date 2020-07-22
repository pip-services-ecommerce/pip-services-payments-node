import { AmountWithBreakdown } from './AmountWithBreakdown';
import { Item } from './Item';

export class PurchaseUnit {
    public amount: AmountWithBreakdown;
    public items: Item[];
}
