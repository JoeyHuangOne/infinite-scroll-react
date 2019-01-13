import { combineReducers } from 'redux-loop';
import { dateChange, dateHourChange, scrollHour } from '../ActionConst.js'


const dateReducer = function (state, action) {
  let newState = state
  if (state === undefined) {
    newState = { currentHour: new Date(Date.now()) };
  }
  else if (action.type === dateChange) {
    let newDate = new Date(state.currentHour)
    newDate.setFullYear(action.newDate.getFullYear(),
      action.newDate.getMonth(),
      action.newDate.getDate())
    newState = { ...state, currentHour: newDate, changeType: action.type };
  }
  else if (action.type === dateHourChange || action.type === scrollHour) {
    let newDate2 = new Date(action.newDateHour)
    newState = { ...state, currentHour: newDate2, changeType: action.type };
  }
  return newState;
}

export default combineReducers({
  dateReducer
})

