import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, mount, render } from 'enzyme';
import DialerHour from '../DialerHour';

import rootReducer from '../reducers'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { install } from 'redux-loop';

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
  const store = createStore(rootReducer, {}, install())
  let hour = new Date('1/16/2019 06:00')
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><DialerHour
    currentHour={hour} /></Provider>,
    div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders hour correctly', () => {
  const store = createStore(rootReducer, {}, install())
  let hour = new Date('1/16/2019 08:00')
  const wrapper = render(<Provider store={store}><DialerHour
    currentHour={hour} /></Provider>);
  expect(wrapper.text()).toEqual('8')
});



