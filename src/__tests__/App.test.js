import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';

import rootReducer from '../reducers'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { install } from 'redux-loop';
const store = createStore(rootReducer, {}, install())

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><App /></Provider>,
    div); ReactDOM.unmountComponentAtNode(div);
});


