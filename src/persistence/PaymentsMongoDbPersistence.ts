let _ = require('lodash');

import { FilterParams, IReferences, Descriptor } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';

import { PaymentV1 } from '../data/version1';
import { IPaymentsPersistence } from './IPaymentsPersistence';

export class PaymentsMongoDbPersistence
  extends IdentifiableMongoDbPersistence<PaymentV1, string>
  implements IPaymentsPersistence {

  constructor() {
    super('payments');
    this._maxPageSize = 1000;
  }

  private composeFilter(filter: FilterParams): any {
    filter = filter || new FilterParams();

    let criteria = [];

    let id = filter.getAsNullableString('id');
    if (id != null)
      criteria.push({ _id: id });

    return criteria.length > 0 ? { $and: criteria } : null;
  }

  public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
    callback: (err: any, page: DataPage<PaymentV1>) => void): void {
    paging = paging || new PagingParams();
    let skip = paging.getSkip(-1);
    let take = paging.getTake(this._maxPageSize);
    let pagingEnabled = paging.total;

    let options: any = {};

    if (skip >= 0) options.skip = skip;
    options.limit = take;

    this._collection.find(this.composeFilter(filter), options).toArray((err, items) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (items != null)
        this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._collectionName);

      items = _.map(items, this.convertToPublic);

      if (pagingEnabled) {
        this._collection.countDocuments(this.composeFilter(filter), (err, count) => {
          if (err) {
            callback(err, null);
            return;
          }

          let page = new DataPage<PaymentV1>(items, count);
          callback(null, page);
        });
      } else {
        let page = new DataPage<PaymentV1>(items);
        callback(null, page);
      }
    });
  }
}