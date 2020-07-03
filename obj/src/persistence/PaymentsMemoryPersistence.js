"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_data_node_1 = require("pip-services3-data-node");
class PaymentsMemoryPersistence extends pip_services3_data_node_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
        this._maxPageSize = 1000;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
        let id = filter.getAsNullableString('id');
        return (item) => {
            if (id != null && item.id != id)
                return false;
            return true;
        };
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        let items = this._items;
        if (_.isFunction(this.composeFilter(filter)))
            items = _.filter(items, this.composeFilter(filter));
        paging = paging != null ? paging : new pip_services3_commons_node_2.PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);
        let total = null;
        if (paging.total)
            total = items.length;
        if (skip > 0)
            items = _.slice(items, skip);
        items = _.take(items, take);
        this._logger.trace(correlationId, "Retrieved %d items", items.length);
        let page = new pip_services3_commons_node_3.DataPage(items, total);
        callback(null, page);
    }
}
exports.PaymentsMemoryPersistence = PaymentsMemoryPersistence;
//# sourceMappingURL=PaymentsMemoryPersistence.js.map