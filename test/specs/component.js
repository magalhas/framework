import {expect} from 'chai';
import React from 'react/addons';
import Dummy from '../fixtures/components/dummy';
import Model from '../../lib/client/model';

const TestUtils = React.addons.TestUtils;

describe('Component', () => {
  it('binds to models', (done) => {
    const component = TestUtils.renderIntoDocument(<Dummy />);
    const model = new Model({a: 123});

    component.setModels({
      a: model
    });
    expect(component.state.a.a).to.equal(123);

    model.set('a', 456);
    setTimeout(() => {
      expect(component.state.a.a).to.equal(456);
      done();
    }, 10);
  });

  it('gets and binds to initial models', (done) => {
    const model = new Model({a: 123});

    Dummy.prototype.getInitialModels = () => {
      return {
        a: model
      };
    };

    const component = TestUtils.renderIntoDocument(<Dummy />);
    delete Dummy.prototype.getInitialModels;

    expect(component.state.a.a).to.equal(123);

    model.set('a', 456);
    setTimeout(() => {
      expect(component.state.a.a).to.equal(456);
      done();
    }, 10);
  });
});
