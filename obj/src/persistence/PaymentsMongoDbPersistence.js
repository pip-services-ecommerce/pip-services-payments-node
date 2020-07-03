"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_mongodb_node_1 = require("pip-services3-mongodb-node");
class PaymentsMongoDbPersistence extends pip_services3_mongodb_node_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('payments');
        this._maxPageSize = 1000;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
        let criteria = [];
        let id = filter.getAsNullableString('id');
        if (id != null)
            criteria.push({ _id: id });
        return criteria.length > 0 ? { $and: criteria } : null;
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        paging = paging || new pip_services3_commons_node_2.PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);
        let pagingEnabled = paging.total;
        let options = {};
        if (skip >= 0)
            options.skip = skip;
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
                    let page = new pip_services3_commons_node_3.DataPage(items, count);
                    callback(null, page);
                });
            }
            else {
                let page = new pip_services3_commons_node_3.DataPage(items);
                callback(null, page);
            }
        });
    }
}
exports.PaymentsMongoDbPersistence = PaymentsMongoDbPersistence;
//# sourceMappingURL=PaymentsMongoDbPersistence.js.map