import {Model} from 'backbone';
import Q from 'q';

export default Model.extend({
  save: function(attributes, options) {
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

    Model.prototype.save.call(this, attributes, options);

    return deferred.promise;
  },
  destroy: function(options){
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

    Model.prototype.destroy.call(this, options);

    return deferred.promise;
  },
  fetch: function(options){
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

    Model.prototype.fetch.call(this, options);

    return deferred.promise;
  }
});
