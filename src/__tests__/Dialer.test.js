import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, mount, render } from 'enzyme';
import Dialer from '../Dialer';

import rootReducer from '../reducers'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { install } from 'redux-loop';

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
  const store = createStore(rootReducer, {}, install())
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><Dialer /></Provider>,
    div); ReactDOM.unmountComponentAtNode(div);
});

it("change date", () => {
  const store = createStore(rootReducer,
    { dateReducer: { currentHour: new Date('1/16/2019 06:00') } }, install())
  let newProp = { initDate: new Date('1/16/2019 06:00') }
  const wrapper = mount(<Provider store={store}><Dialer initDate={newProp} /></Provider>);
  newProp = { initDate: new Date('1/16/2019 08:00') }
  wrapper.instance().componentDidUpdate(newProp)
  wrapper.setProps(newProp)
  wrapper.setState({ currentHour: new Date('1/16/2019 08:00') })
  wrapper.update();
});

