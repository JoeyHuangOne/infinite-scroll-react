import { dateChange, dateHourChange, scrollHour, dragMoveHour, dragEndHour } from '../ActionConst.js'

export const newDateAction = (newDate) => ({ type: dateChange, newDate })

export const newDateHourAction = (newDateHour) => ({ type: dateHourChange, newDateHour })

export const scrollHourAction = (newDateHour) => ({ type: scrollHour, newDateHour })

export const dragMoveHourAction = (newDateHour) => ({ type: dragMoveHour, newDateHour })

