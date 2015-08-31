import {Events} from 'backbone';
import merge from 'lodash.merge';
import Q from 'q';

class ActionsInterface {
   constructor () {
      if (this.init) {
         this.init();
      }
      // Create methods to trigger actions specified inside `@getActions`
      this.getActions().forEach((actionName) => {
        this[actionName] = (data) => {
          return this.triggerPromise.call(this, actionName, data);
        };
      });
   }

   destroy () {
      this.stopListening();
   }

   getActions () {
     throw new Error('Actions#getActions must be implemented');
   }

   triggerPromise (eventName, data) {
      var deferred = Q.defer();

      this.trigger(eventName, data, deferred);

      return deferred.promise;
   }
}
merge(ActionsInterface.prototype, Events);

export default ActionsInterface;
