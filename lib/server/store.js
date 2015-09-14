import Store from '../store';
import Q from 'q';
import merge from 'lodash.merge';

export default class ServerStore extends Store {
  constructor () {
    super();
  }

  processQueryOptions (query, options) {
    if (this.defaultQueryOptions) {
      options = merge(this.defaultQueryOptions, options);
    }

    // Populate
    if (options.populate) {
      query.populate(options.populate);
    }

    // Sort
    if (options.sort) {
      let sort = {};
      sort[options.sort] = options.order || 'asc';
      query.sort(sort);
    }

    // Skip
    if (options.skip) {
      query.skip(options.skip);
    }

    // Limit
    if (options.limit) {
      query.limit(options.limit);
    }
  }

  add (data, options = {}) {
    var model = new this.Model(data);

    if (this.defaultQueryOptions) {
      options = merge(this.defaultQueryOptions, options);
    }

    return Q()
      .then(() => Q.ninvoke(model, 'save'))
      .then(() => {
        if (options.populate) {
          return Q()
            .then(() => Q.ninvoke(this.Model, 'populate', model, options.populate))
            .then((entry) => entry.toJSON());
        } else {
          return model.toJSON();
        }
      });
  }

  count (query) {
    return Q
      .ninvoke(this.Model, 'count', query)
      .then((count) => {
        return count;
      });
  }

  findAll (options = {}) {
    var queryOptions = {};
    if (options.search && options.s) {
      queryOptions[options.search] = new RegExp('.*'+options.s, 'i');
    }

    if (options.query) {
      merge(queryOptions, options.query);
    }

    var query = this.Model.find(queryOptions, options.projection);
    this.processQueryOptions(query, options);

    return Q()
      .then(() => query.exec())
      .then(function (entries) {
        entries = entries.map((entry) => entry.toJSON());
        return entries;
      });
  }

  findById (id, options = {}) {
    let query = this.Model.findById(id);
    this.processQueryOptions(query, options);

    return Q()
      .then(() => query.exec())
      .then((entry) => {
        if (entry) {
          return entry.toJSON();
        } else {
          throw new Error('Object not found');
        }
      });
  }

  findByIds (ids, options = {}) {
    let query = this.Model.find({_id: {$in: ids}}, options.projection);
    this.processQueryOptions(query, options);

    return Q()
      .then(() => query.exec())
      .then((entries) => entries.map((entry) => entry.toJSON()));
  }

  findOne (queryObj, options = {}) {
    let query = this.Model.findOne(queryObj);
    this.processQueryOptions(query, options);

    return Q()
      .then(() => query.exec())
      .then((entry) => {
        if (entry) {
          return entry.toJSON();
        } else {
          throw new Error('Object not found');
        }
      });
  }

  remove (id) {
    return Q
      .ninvoke(this.Model, 'findByIdAndRemove', id)
      .then((entry) => {
        entry.remove && entry.remove();
        return entry.toJSON();
      });
  }

  update (id, data, options = {}) {
    let query = this.Model.findByIdAndUpdate(
      id,
      {$set: data},
      {upsert: true, new: true}
    );
    this.processQueryOptions(query, options);

    return Q()
      .then(() => query.exec())
      .then((entry) => {
        return entry.toJSON();
      });
  }
}
