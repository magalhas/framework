import backboneReactComponent from 'backbone-react-component';
import {Events} from 'backbone';
import forEach from 'lodash.foreach';
import merge from 'lodash.merge';
import React from 'react';
import {isClient} from './utils';

export default class BaseComponent extends React.Component {
  constructor (props, children) {
    super(props, children);

    this.state = this.getInitialState ? this.getInitialState() : {};

    if (this.getInitialCollections && this.isClient()) {
      this.collections = this.getInitialCollections();
    }

    if (this.getInitialModels && this.isClient()) {
      this.models = this.getInitialModels();
    }
  }

  setModels (models) {
    if (!this.models) {
      this.models = {};
    }

    forEach(models, (model, key) => {
      if (this.models[key]) {
        backboneReactComponent.off(this, this.models[key]);
      }
      this.models[key] = model;
      backboneReactComponent.onModel(this, {[key]: model});
    });
  }

  unsetModels (keys) {
    forEach(keys, (key) => {
      if (this.models[key]) {
        backboneReactComponent.off(this, this.models[key]);
      }
    });
  }

  setCollections (collections) {
    this.stopListening();

    if (!this.collections) {
      this.collections = collections;
    } else {
      merge(this.collections, collections);
    }

    forEach(this.collections, (collection, key) => {
      this.listenTo(collection, 'update', this.onCollectionUpdate.bind(this, key));
      this.onCollectionUpdate(key, collection);
    });
  }

  parseSettings (_settings) {
    var settings = {};
    forEach(_settings, (setting) => {
      settings[setting._id] = setting.value;
    });

    return settings;
  }

  componentDidMount () {
    if (this.collections) {
      forEach(this.collections, (collection, key) => {
        this.listenTo(collection, 'update change', this.onCollectionUpdate.bind(this, key));
        this.onCollectionUpdate(key);
      });
    }
    if (this.models) {
      backboneReactComponent.onModel(this, this.models);
    }
  }

  componentWillUnmount () {
    backboneReactComponent.off(this);
    this.stopListening();
  }

  onCollectionUpdate (key) {
    this.setState({[key]: this.collections[key].toJSON()});
  }

  isClient () {
    return isClient();
  }
}

merge(BaseComponent.prototype, Events);
