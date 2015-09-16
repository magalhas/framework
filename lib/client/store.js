import Store from '../store';
import Q from 'q';
import {Events} from 'backbone';
import merge from 'lodash.merge';
import forEach from 'lodash.foreach';
import cloneDeep from 'lodash.merge';

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

    if (this.data || options.data) {
      this.collection.add(this.data || options.data);
      this.data = null;
      this.setActionTimestamp();
    } else if (options.fetch) {
      this.collection.fetch();
    }

    return this.collection;
  }

  getModel (modelId) {
    this.getCollection({fetch: false});
    var model = this.collection.get(modelId);

    if (!model) {
      const Model = this.collection.model;
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

  getCollectionUpdated (options = {}) {
    this.getCollection({fetch: false});
    var result;

    if (this.shouldCollectionUpdate(options)) {
      result = Q()
        .then(() => this.collection.fetch())
        .then(() => {
          return this.collection;
        });
    } else {
      result = Q().then(() => this.collection);
    }

    return result;
  }

  fetchCollection () {
    this.getCollection({fetch: false});
    return this.collection
      .fetch()
      .then(() => {
        return this.collection;
      });
  }

  findAll (options = {}) {
    return Q()
      .then(() => this.getCollectionUpdated(options))
      .then((collection) => {
        return collection.toJSON();
      });
  }

  add (data, deferred) {
    this.getCollection({fetch: false});

    return Q()
      .then(() => this.collection.create(data, {wait: true}))
      .spread((model) => {
        model = model.toJSON();
        deferred && deferred.resolve(model);
        return model;
      })
      .catch((error) => {
        this.collection.trigger('error', error);
        deferred && deferred.reject(error);
      });
  }

  remove (_id, deferred) {
    var model;

    return Q()
      .then(() => this.getCollection({fetch: false}).findWhere({_id}))
      .then((_model) => {
        model = _model;
        this.options = cloneDeep(this.collection.options);
        delete this.collection.options;
        return model.destroy({wait: true});
      })
      .fin(() => {
        this.collection.options = this.options;
        delete this.options;
        deferred && deferred.resolve(model.toJSON());
      })
      .catch((error) => {
        this.collection.trigger('error', error);
        deferred && deferred.reject(error);
      });
  }

  findOne (find) {
    return Q()
      .then(() => this.getCollectionUpdated())
      .then((collection) => collection.findWhere(find))
      .then((model) => {
        return model.toJSON();
      });
  }

  findById (modelId) {
    const deferred = Q.defer();
    const collection = this.getCollection({fetch: false});
    const Model = collection.model;
    const idAttribute = Model.prototype.idAttribute;
    const id = typeof modelId === 'object' ? (Model.prototype.parse(modelId))[Model.prototype.idAttribute] : modelId;
    let model = collection.get(id);

    if (!model) {
      model = typeof modelId === 'object' ? modelId : {};
      model[idAttribute] = id;
      model = new Model(model);
      model
        .fetch()
        .spread((model) => {
          deferred.resolve(model.toJSON());
        })
        .catch(() => {
          deferred.error();
        });
    } else {
      model = model.clone();
      if (this.shouldCollectionUpdate()) {
        model
          .fetch()
          .spread((model) => {
            deferred.resolve(model.toJSON());
          })
          .catch(() => {
            deferred.error();
          });
      } else {
        deferred.resolve(model.toJSON());
      }
    }

    return deferred.promise;
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
