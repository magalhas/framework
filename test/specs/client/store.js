import {expect} from 'chai';
import Store from '../../../lib/client/store';
import Backbone from 'backbone';
import express from 'express';
import $ from 'jquery';
import sinon from 'sinon';
Backbone.$ = $;

var app = express();
const PORT = '8080';

// express api for testing
app.get('/api', (req, res) => {
  console.log('HERE');
  res.send(200, [{ _id: 0}, {_id: 1}, {_id: 2}]);
});

describe('Client Store', () => {
  before((done) => {
    // Start server
    app.listen(PORT, () => {
      done();
    });
  });

  it('has fetch interval', () => {
    class StoreImplementation extends Store {}
    const store = new StoreImplementation();
    expect(store.fetchInterval).to.be.a('number');
  });

  it('throws error when missing create collection', () => {
    class StoreImplementation extends Store {}
    const store = new StoreImplementation();
    expect(store.createCollection).to.be.throw(Error);
  });

  describe('Get Collection', () => {
    let Model = Backbone.Model.extend({
      idAttribute: '_id'
    });
    let Collection = Backbone.Collection.extend({
      model: Model
    });
    class StoreImplementation extends Store {
      createCollection () {
        return new Collection();
      }
    }

    it('url must be defined in collection', () => {
      const store = new StoreImplementation();
      expect(store.getCollection).to.be.throw(Error);
    });

    Collection = Backbone.Collection.extend({
      model: Model,
      url: '/api'
    });

    it('get collection returns collection', () => {
      const store = new StoreImplementation();
      expect(store.getCollection()).to.be.a('object');
      expect(store.getCollection()).to.be.a('object');
    });

    it('adds data if passed on this.data', () => {
      const store = new StoreImplementation();
      store.data = [
        {_id: 0},
        {_id: 1},
        {_id: 2}
      ];
      const collection = store.getCollection();
      expect(store.data).to.equal(null);
      expect(collection.length).to.equal(3);
      store.data = [
        {_id: 3},
        {_id: 4},
        {_id: 5}
      ];
      store.getCollection();
      expect(store.data).to.equal(null);
      expect(collection.length).to.equal(6);
    });

    it('adds data if passed on through get collection options', () => {
      const store = new StoreImplementation();
      const collection = store.getCollection({
        data: [
          {_id: 0},
          {_id: 1},
          {_id: 2}
        ]
      });
      expect(collection.length).to.equal(3);
      store.getCollection({
        data: [
          {_id: 3},
          {_id: 4},
          {_id: 5}
        ]
      });
      expect(collection.length).to.equal(6);
    });

    it('appends new data instead of replacing', () => {
      const store = new StoreImplementation();
      const collection = store.getCollection({
        data: [
          {_id: 0},
          {_id: 1},
          {_id: 2}
        ]
      });
      expect(collection.length).to.equal(3);
      store.getCollection({
        data: [
          {_id: 0},
          {_id: 1},
          {_id: 2}
        ]
      });
      expect(collection.length).to.equal(3);
    });

    it('get collection fetches collection when no data is passed', () => {
      const store = new StoreImplementation();
      sinon.stub($, 'ajax');
      store.getCollection();
      expect($.ajax.calledWithMatch({ url: '/api' })).to.equal(true);
      expect($.ajax.calledOnce).to.equal(true);
    });

  });
});
