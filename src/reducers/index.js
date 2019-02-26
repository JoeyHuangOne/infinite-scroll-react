import { combineReducers } from 'redux-loop';
import { dateChange, dateHourChange, dragMoveHour } from '../ActionConst.js'


const dateReducer = function (state, action) {
  let newState = state
  if (state === undefined) {
    let newDate = new Date(Date.now())
    newState = { currentHour: newDate, movingHour: newDate, center: true };
  }
  else if (action.type === dateChange) {
    let newDate = new Date(state.currentHour)
    newDate.setFullYear(action.newDate.getFullYear(),
      action.newDate.getMonth(),
      action.newDate.getDate())
    newState = { ...state, currentHour: newDate, movingHour: newDate, center: false };
  } else if (action.type === dragMoveHour) {
    let newDate = new Date(action.newDateHour)
    newState = { ...state, movingHour: newDate, center: false };
  }
  else {
    let newDate2 = new Date(action.newDateHour)
    newState = { ...state, currentHour: newDate2, movingHour: newDate2, center: action.type === dateHourChange };
  }
  return newState;
}

export default combineReducers({
  dateReducer
})

