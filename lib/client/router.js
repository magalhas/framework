import React from 'react';
import {Router} from 'backbone';
import merge from 'lodash.merge';

export default Router.extend({
   renderComponent (Component, _props) {
      var props = this.getInitialProps();
      merge(props, _props);
      var component = React.createElement(Component, props);
      React.render(component, document.getElementById('view'));
   },

   getInitialProps () {
      var props = window.initialProps || {};
      window.initialProps = void 0;
      return props;
   },
});
