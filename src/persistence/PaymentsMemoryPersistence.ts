let _ = require('lodash');

import { FilterParams, IReferences, Descriptor, ObjectWriter, IdGenerator } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';

import { PaymentV1 } from '../data/version1';
import { IPaymentsPersistence } from './IPaymentsPersistence';

export class PaymentsMemoryPersistence
  extends IdentifiableMemoryPersistence<PaymentV1, string>
  implements IPaymentsPersistence {

  constructor() {
    super();

    this._maxPageSize = 1000;
  }

  private composeFilter(filter: FilterParams): any {
    filter = filter || new FilterParams();

    let id = filter.getAsNullableString('id');

    return (item) => {
      if (id != null && item.id != id)
        return false;
      return true;
    };
  }

  public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
    callback: (err: any, page: DataPage<PaymentV1>) => void): void {
    let items = this._items;

    if (_.isFunction(this.composeFilter(filter)))
      items = _.filter(items, this.composeFilter(filter));

    paging = paging != null ? paging : new PagingParams();
    let skip = paging.getSkip(-1);
    let take = paging.getTake(this._maxPageSize);

    let total = null;
    if (paging.total)
      total = items.length;

    if (skip > 0)
      items = _.slice(items, skip);
    items = _.take(items, take);

    this._logger.trace(correlationId, "Retrieved %d items", items.length);

    let page = new DataPage<PaymentV1>(items, total);
    callback(null, page);
  }
}