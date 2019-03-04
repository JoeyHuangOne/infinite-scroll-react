import React, { useEffect, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction, dragMoveHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js"
import * as Rx from 'rxjs/Rx';
import useRxRef from './useRx.js'

const eventThrottle = 15
const hourInMs = 3600000

let Dialer = React.memo(props => {
  let start2currentHour = Math.floor(props.totalHours / 2)
  let visible2currentHour = Math.floor(props.visibleHours / 2)
  let dialerRef = useRef()

  const [initDateRxRef, initDateRxNext] = useRxRef(props.initDate)
  initDateRxNext(props.initDate)

  const hours = fillHours(props.initDate)
  const hourChildren = renderHours(hours)

  const scrollRx = useRef(null)
  const mouseMoveRxRef = useRef(null)
  const dragRxRef = useRef(null)
  const resizeRxRef = useRef(null)

  useLayoutEffect(() => { props.center && centerDialer() })

  useEffect(() => { //for resize event
    if (resizeRxRef.current) return

    resizeRxRef.current = Rx.Observable
      .fromEvent(window, 'resize')
      .throttleTime(eventThrottle)
      .withLatestFrom(initDateRxRef.current)
      .subscribe(event => {
        props.changeDateHour(event[1])
      })
    return () => {
      resizeRxRef.current && resizeRxRef.current.unsubscribe()
      resizeRxRef.current = null
    }
  }, [])

  useEffect(() => { //for scroll event
    if (scrollRx.current) return

    let mouseUp = Rx.Observable.fromEvent(dialerRef.current, 'mouseup'),
      mouseDown = Rx.Observable.fromEvent(dialerRef.current, 'mousedown'),
      resizeRx = Rx.Observable.fromEvent(window, 'resize'),
      mouseUpDwon = Rx.Observable.merge(mouseDown, mouseUp, resizeRx).startWith({})
    scrollRx.current = Rx.Observable
      .fromEvent(dialerRef.current, 'scroll')
      .throttleTime(eventThrottle)
      .withLatestFrom(initDateRxRef.current, mouseUpDwon)
      .subscribe(events => {
        let event = events[0], initDate = events[1], mouseUpDown = events[2]
        if ((mouseUpDown.buttons === 1 && mouseUpDown.type === 'mousedown')
          || mouseUpDown.type === 'resize') return
        let newCenterHour = counterScroll(event.target.scrollLeft, initDate)
        props.scrollHour(newCenterHour)
      });

    return () => {
      scrollRx.current.unsubscribe()
      scrollRx.current = null
    }
  }, [])

  useEffect(() => { // for drag event
    if (dragRxRef.current) return

    let mouseUp = Rx.Observable.fromEvent(dialerRef.current, 'mouseup'),
      mouseDown = Rx.Observable.fromEvent(dialerRef.current, 'mousedown')
    Rx.Observable.merge(mouseDown, mouseUp)
      .withLatestFrom(initDateRxRef.current)
      .subscribe(events => {
        let event = events[0], dragStartHour = events[1]
        if (event.type === 'mousedown' && event.buttons === 1) {
          let dragStartPosX = event.clientX,
            dragStartScoll = dialerRef.current.scrollLeft
          mouseMoveRxRef.current = Rx.Observable
            .fromEvent(dialerRef.current, 'mousemove')
            .throttleTime(eventThrottle)
            .subscribe(event => {
              if (event.buttons !== 1) {
                mouseMoveRxRef.current && mouseMoveRxRef.current.unsubscribe()
                mouseMoveRxRef.current = null
              }
              else {
                let mouseDiff = dragStartPosX - event.clientX,
                  scroll = dragStartScoll + mouseDiff
                dialerRef.current.scrollLeft = scroll
                let newHour = convertX2Hour(scroll, dragStartHour)
                props.dragMoveHour(newHour)
              }
            })
        } else if (event.type === 'mouseup') {
          mouseMoveRxRef.current && mouseMoveRxRef.current.unsubscribe()
          mouseMoveRxRef.current = null

          let newCenterHour = counterScroll(dialerRef.current.scrollLeft, dragStartHour)
          props.scrollHour(newCenterHour)
        }
      })

    return () => {
      dragRxRef.current && dragRxRef.current.unsubscribe();
      dragRxRef.current = null
    }
  }, [])


  function scrollByHour(hours) {
    let hoursWidth = dialerRef.current.clientWidth / props.visibleHours * hours
    dialerRef.current.scrollLeft += hoursWidth
  }

  function centerDialer() {
    let cellWidth = dialerRef.current.clientWidth / props.visibleHours
    dialerRef.current.scrollLeft = (start2currentHour - visible2currentHour) * cellWidth
  }

  function fillHours(currentHour) {
    let newHours = []
    for (var idx = 0; idx < props.totalHours; idx++) {
      let newDate = plusHour(currentHour, idx - start2currentHour)
      newHours.push(newDate)
    }
    return newHours
  }

  function convertX2Hour(scrollLeft, currentHour) {
    let hourWidth = dialerRef.current.clientWidth / props.visibleHours
    let pointer = hourWidth * (props.visibleHours / 2) + scrollLeft
    let hourIdx = Math.floor(pointer / hourWidth)
    let newHour = plusHour(currentHour, hourIdx - start2currentHour)
    return newHour
  }

  function counterScroll(scrollLeft, centerHour) {
    let newCebterHour = convertX2Hour(scrollLeft, centerHour)
    let hourDiff = diffHour(newCebterHour, centerHour)
    scrollByHour(-hourDiff)
    return newCebterHour
  }

  function renderHours(hours) {
    let newHours = []
    let width = 100 / props.visibleHours + '%'
    hours.forEach(hour => {
      newHours.push(
        <DialerHour
          key={hour.valueOf()}
          cellWidth={width}
          currentHour={hour}
        />
      )
    })
    return newHours
  }

  return (
    <div>
      <DialerDate currentDate={props.initDate} />
      <p></p>
      <div className='hourContainer' id='hourContainer' ref={dialerRef}>
        {hourChildren}
      </div>
    </div>
  );
})

function plusHour(date, hour = 0) {
  let newDate = date.valueOf()
  newDate += hour * hourInMs
  let retDate = new Date(newDate)
  return retDate
}

function diffHour(newTime, orgTime) {
  let newHour = new Date(newTime)
  newHour.setHours(newHour.getHours(), 0, 0, 0)
  let orgHour = new Date(orgTime)
  orgHour.setHours(orgHour.getHours(), 0, 0, 0)
  let diff = newHour.valueOf() - orgHour.valueOf()
  return diff / hourInMs
}

Dialer.propTypes = {
  initDate: PropTypes.instanceOf(Date),
  center: PropTypes.bool,
  visibleHours: PropTypes.number,
  totalHours: PropTypes.number,
  scrollHour: PropTypes.func,
  changeDate: PropTypes.func,
  dragMoveHour: PropTypes.func,
}

Dialer.defaultProps = {
  visibleHours: 11,
  totalHours: 55,
  initDate: new Date(Date.now()),
}

const mapStateToProps = function (state) {
  return {
    initDate: state.dateReducer.currentHour,
    center: state.dateReducer.center
  };
}

const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    changeDate: (newDate) => {
      dispatch(newDateAction({ newDate }));
    },
    scrollHour: (newHour) => {
      dispatch(scrollHourAction(newHour));
    },
    changeDateHour: (newHour) => {
      dispatch(newDateHourAction(newHour));
    },
    dragMoveHour: (newHour) => {
      dispatch(dragMoveHourAction(newHour));
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialer);

