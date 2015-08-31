import {expect} from 'chai';
import Store from '../../lib/store';

describe('Store', () => {
  it('calls init when instanced', (done) => {
    expect(new (class extends Store {
      init () {
        done();
      }
    })()).to.be.defined;
  });

  it('detects if it is running in the client', () => {
    class StoreImplementation extends Store {}
    const store = new StoreImplementation();
    expect(store.isClient).to.be.falsy;
  });

  it('throws errors when missing methods implementation', () => {
    class StoreImplementation extends Store {}
    const store = new StoreImplementation();
    expect(store.add).to.throw(Error);
    expect(store.count).to.throw(Error);
    expect(store.findById).to.throw(Error);
    expect(store.findAll).to.throw(Error);
    expect(store.findOne).to.throw(Error);
    expect(store.remove).to.throw(Error);
    expect(store.update).to.throw(Error);
  });
});
