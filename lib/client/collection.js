import {Collection} from 'backbone';
import Q from 'q';

export default Collection.extend({
  initialize: function (models, options) {
    Collection.prototype.initialize.apply(this, arguments);
    this.options = options || {};
  },
  create: function (attributes, options) {
    var deferred = Q.defer();

    options = options || {};

    var _success = options && options.success;
    var _error = options && options.error;

    options.success = (model, res, options) => {
      _success && _success(model, res, options);
      deferred.resolve([model, res, options]);
    };

    options.error = (model, res, options) => {
      _error && _error(model, res, options);
      deferred.reject([model, res, options]);
    };

    Collection.prototype.create.call(this, attributes, options);

    return deferred.promise;
  },
  createOrUpdate: function(attributes) {
    const idAttributeKey = this.model.idAttribute;
    const id = attributes[idAttributeKey];

    var promise, model;
    if (id) {
      model = this.get(id);
    }
    if (model) {
      promise = model.save(attributes, {wait: true});
    } else {
      promise = this.create(attributes);
    }

    return promise;
  },
  fetch: function (options) {
    var deferred = Q.defer();

    options = options || {};

    var _success = options && options.success;
    var _error = options && options.error;

    options.success = (models, res, options) => {
      _success && _success(models, res, options);
      deferred.resolve([models, res, options]);
    };

    options.error = (models, res, options) => {
      _error && _error(models, res, options);
      deferred.reject([models, res, options]);
    };

    Collection.prototype.fetch.call(this, options);

    return deferred.promise;
  },
  findWhere: function (attributes) {
    var deferred = Q.defer();

    var result = Collection.prototype.findWhere.call(this, attributes);
    deferred.resolve(result);

    return deferred.promise;
  }
});
