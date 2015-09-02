import Store from '../store';
import Q from 'q';
import {Events} from 'backbone';
import merge from 'lodash.merge';
import forEach from 'lodash.foreach';

export default class ClientStore extends Store {
  constructor (options) {
    super(options);
    this.fetchInterval = 10000;
  }

  destroy () {
    this.stopListening();
  }

  createCollection () {
    throw new Error('Store#createCollection must be implemented');
  }

  getCollection (options = {fetch: true}) {
    if (!this.collection) {
      this.collection = this.createCollection();
    }

    if (options.options) {
      this.collection.options = options.options;
    }

    if (this.data) {
      this.collection.add(this.data);
      this.data = null;
      this.setActionTimestamp();
    } else if (options.fetch) {
      this.collection.fetch();
    }

    return this.collection;
  }

  getCollectionAsync (options = {}) {
    var collection = this.getCollection({fetch: false});
    var result;

    if(this.shouldCollectionUpdate(options)){
      result = Q()
        .then(() => collection.fetch())
        .then(() => {
          return this.collection;
        });
    } else {
      result = Q().then(() => collection);
    }

    return result;
  }

  fetchCollection () {
    var collection = this.getCollection({fetch: false});

    return collection
      .fetch()
      .then(() => {
        return this.collection;
      });
  }

  setActionTimestamp () {
    this.lastActionTimestamp = new Date().getTime();
  }

  shouldCollectionUpdate (options = {}) {
    var shouldCollectionUpdate = false;

    forEach(options, (value, key) => {
      if(!this.collection.options || !this.collection.options[key] || this.collection.options[key] !== value){
        shouldCollectionUpdate = true;
        return false;
      }
    });

    if (!shouldCollectionUpdate) {
      forEach(this.collection.options, (value, key) => {
        if(!options[key] || options[key] !== value){
          shouldCollectionUpdate = true;
          return false;
        }
      });
    }

    if (!shouldCollectionUpdate){
      if (this.lastActionTimestamp) {
        shouldCollectionUpdate = (new Date().getTime() - this.lastActionTimestamp) > this.fetchInterval;
      } else {
        shouldCollectionUpdate = true;
      }
    } else {
      this.collection.options = options;
    }

    return shouldCollectionUpdate;
  }

  runPromises (deferred, promises) {
    deferred.promise = deferred.promise
      .then(() => {
        var promise = Q();

        promises.forEach(function (_promise) {
          promise = promise
          .then(function () {
            return _promise.apply(null, arguments);
          });
        });

        return promise;
      })
      .then(function () {
        return arguments[arguments.length - 1];
      });
  }

  getModel (modelId) {
    const collection = this.getCollection({fetch: false});
    var model = collection.get(modelId);

    if (!model) {
      const Model = collection.model;
      const idAttribute = Model.prototype.idAttribute;

      model = {};
      model[idAttribute] = modelId;
      model = new Model(model);
      model.fetch();
    } else {
      model = model.clone();
      if (this.shouldCollectionUpdate()) {
        model.fetch();
      }
    }

    return model;
  }

  findAll (options = {}) {
    return Q()
      .then(() => this.getCollectionAsync(options))
      .then((collection) => {
        return collection.toJSON();
      });
  }

  add (data, deferred) {
    return Q()
      .then(() => this.getCollection({fetch: false}).create(data, {wait: true}))
      .spread((model) => {
        model = model.toJSON();
        deferred.resolve(model);
        return model;
      })
      .catch((error) => {
        this.collection.trigger('error', error);
        deferred.reject(error);
      });
  }

  remove (_id, deferred) {
    var model;

    return Q()
      .then(() => this.getCollection({fetch: false}).findWhere({_id}))
      .then((_model) => {
        model = _model;
        this.options = merge({}, this.collection.options); // XXX
        delete this.collection.options;
        return model.destroy({wait: true});
      })
      .fin(() => {
        this.collection.options = this.options;
        deferred.resolve(model.toJSON());
      })
      .catch((error) => {
        this.collection.trigger('error', error);
        deferred.reject(error);
      });
  }

  findOne (find) {
    return Q()
      .then(() => this.getCollectionAsync())
      .then((collection) => collection.findWhere(find))
      .then((model) => {
        return model.toJSON();
      });
  }

  findById (_id) {
    return Q()
      .then(() => this.getCollectionAsync())
      .then((collection) => collection.get(_id));
  }

  update (data, deferred) {
    var model = this.getCollection({fetch: false}).get(data._id);
    return Q()
      .then(() => model.save(data, {wait: true}))
      .spread(() => {
        model = model.toJSON();
        deferred.resolve(model);
        return model;
      })
      .catch((error) => {
        this.collection.trigger('error', error);
        deferred.reject(error);
      });
  }
}

merge(ClientStore.prototype, Events);
