import Store from '../store';
import Q from 'q';
import merge from 'lodash.merge';

export default class ServerStore extends Store {
  constructor () {
    super();
  }

  add (data) {
    var model = new this.Model(data);

    return Q
      .ninvoke(model, 'save')
      .then(() => {
        return model.toJSON();
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

    var query = this.Model.find(queryOptions);

    if (options.populate) {
      query.populate(options.populate);
    }

    if (options.sort) {
      let sort = {};
      sort[options.sort] = options.order || 'asc';
      query.sort(sort);
    }

    return Q()
      .then(() => query.exec())
      .then(function (entries) {
        entries = entries.map((entry) => entry.toJSON());
        return entries;
      });
  }

  findById (id) {
    return Q
      .ninvoke(this.Model, 'findById', id)
      .then((entry) => {
        if (entry) {
          return entry.toJSON();
        } else {
          throw new Error('Object not found');
        }
      });
  }

  findByIds (ids, projection = null) {
    return Q()
      .then(() => this.Model.find({_id: {$in: ids}}, projection))
      .then((entries) => entries.map((entry) => entry.toJSON()));
  }

  findOne (query) {
    return Q
      .ninvoke(this.Model, 'findOne', query)
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

  update (id, data) {
    return Q
      .ninvoke(this.Model, 'findByIdAndUpdate', id, {$set: data}, {upsert: true, new: true})
      .then((entry) => {
        return entry;
      });
  }
}
