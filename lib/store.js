import {isClient} from './utils';

class StoreInterface {
  constructor () {
    if (this.init) {
      this.init();
    }
  }

  isClient () {
    return isClient();
  }

  add () {
    throw new Error('Store#add must be implemented');
  }

  count () {
    throw new Error('Store#count must be implemented');
  }

  findById () {
    throw new Error('Store#findById must be implemented');
  }

  findAll () {
    throw new Error('Store#findAll must be implemented');
  }

  findOne () {
    throw new Error('Store#findOne must be implemented');
  }

  remove () {
    throw new Error('Store#remove must be implemented');
  }

  update () {
    throw new Error('Store#update must be implemented');
  }

}

export default StoreInterface;
