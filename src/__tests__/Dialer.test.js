import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, mount, render } from 'enzyme';
import ReduxDialer, { Dialer } from '../Dialer';

import rootReducer from '../reducers'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { install } from 'redux-loop';
import { dateChange, dateHourChange, scrollHour } from '../ActionConst.js'

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
  const store = createStore(rootReducer, {}, install())
  const div = document.createElement('div');
  ReactDOM.render(<Provider store={store}><ReduxDialer /></Provider>,
    div); ReactDOM.unmountComponentAtNode(div);
});

it("test fillHours() and convertX2Hour()", () => {
  const wrapper = shallow(<Dialer />, { disableLifecycleMethods: true })
  let inst = wrapper.instance()
  inst.dialerRef = {
    "current": {
      "scrollLeft": 100,
      "clientWidth": 220,
    }
  }
  let newDate = new Date('1/16/2019 06:00')
  let hours = inst.fillHours(newDate)
  let hour0 = new Date('1/15/2019 14:00')
  expect(hours.length).toEqual(33)
  expect(hours[0]).toEqual(hour0)
  expect(hours[16]).toEqual(newDate)
  expect(hours[32]).toEqual(new Date('1/16/2019 22:00'))
  wrapper.setState({ hours })

  let newHour = inst.convertX2Hour(220)
  expect(newHour).toEqual(newDate)
});

it("test componentDidUpdate()", () => {
  const wrapper = shallow(<Dialer />, { disableLifecycleMethods: true })
  let inst = wrapper.instance()
  inst.dialerRef = {
    "current": {
      "scrollLeft": 100,
      "clientWidth": 220,
    }
  }
  wrapper.setProps({
    initDate: new Date('1/16/2019 06:00'),
    changeType: dateChange
  })
  inst.componentDidUpdate({ initDate: new Date('1/16/2019 09:00') })
});
