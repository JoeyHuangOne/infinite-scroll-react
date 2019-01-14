import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, mount, render } from 'enzyme';
import DialerDate from '../DialerDate.js';

import rootReducer from '../reducers'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { install } from 'redux-loop';
const store = createStore(rootReducer, { currentHour: new Date('1/16/2019 06:00') }, install())

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><DialerDate /></Provider>,
    div); ReactDOM.unmountComponentAtNode(div);
});


