import { dateChange, dateHourChange, scrollHour } from '../ActionConst.js'

export const newDateAction = (newDate) => ({ type: dateChange, newDate })

export const newDateHourAction = (newDateHour) => ({ type: dateHourChange, newDateHour })

export const scrollHourAction = (newDateHour) => ({ type: scrollHour, newDateHour })
