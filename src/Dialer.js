import React, { useEffect, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction, dragMoveHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js"
import * as Rx from 'rxjs/Rx'
import { throttleTime, withLatestFrom } from 'rxjs/operators'
import { useRxRef } from './useRx.js'

const eventThrottle = 15
const hourInMs = 3600000

let Dialer = React.memo(props => {
  let start2currentHour = Math.floor(props.totalHours / 2)
  let visible2currentHour = Math.floor(props.visibleHours / 2)
  let dialerRef = useRef()

  const hours = fillHours(props.initDate)
  const hourChildren = renderHours(hours)

  useLayoutEffect(() => { props.center && centerDialer() })

  const toggleResizeObserveRef = useRef()
  useEffect(() => {
    if (toggleResizeObserveRef.current) return

    let resizeRx = Rx.Observable.fromEvent(window, 'resize').share()
    let mouseUpRx = Rx.Observable.fromEvent(dialerRef.current, 'mouseup').share()
    let mouseDownRx = Rx.Observable.fromEvent(dialerRef.current, 'mousedown').share()
    let scrollRx = Rx.Observable.fromEvent(dialerRef.current, 'scroll').share()

    var toggleResize = Rx.Observable.create(observer => {
      toggleResizeObserveRef.current = observer
      resizeRx.subscribe(event => { observer.next(event) })
    })
    let mouseUpDwonResize = Rx.Observable.merge(mouseDownRx, mouseUpRx, toggleResize)
      .startWith({})

    let scrollSubscript = handleScroll(scrollRx, mouseUpDwonResize)
    let resizeSubscript = handleResize(resizeRx)
    let dragSubscript = handleDrag(mouseDownRx, mouseUpRx)

    return () => {
      resizeSubscript.unsubscribe()
      scrollSubscript.unsubscribe()
      dragSubscript.unsubscribe()
      toggleResizeObserveRef.current && toggleResizeObserveRef.current.unsubscribe()
      toggleResizeObserveRef.current = null
    }
  }, [])

  const [initDateRxRef, initDateRxNext] = useRxRef(props.initDate)
  initDateRxNext(props.initDate)
  function handleResize(shareResizeRx) {
    let resizeSubscript = shareResizeRx
      .pipe(
        throttleTime(eventThrottle),
        withLatestFrom(initDateRxRef.current)
      ).subscribe(event => {
        props.changeDateHour(event[1])
      })
    return resizeSubscript
  }

  function handleScroll(scrollRx, mouseUpDwonResize) {
    let scrollSubscript = scrollRx
      .pipe(
        throttleTime(eventThrottle),
        withLatestFrom(initDateRxRef.current, mouseUpDwonResize)
      ).subscribe(events => {
        let event = events[0], initDate = events[1], mouseUpDown = events[2]
        if (mouseUpDown.type === 'resize') { // scroll triggered by resize so skip it
          toggleResizeObserveRef.current.next({}) // so scroll works after resize
          return
        }
        if (mouseUpDown.buttons === 1 && mouseUpDown.type === 'mousedown') return
        let newCenterHour = counterScroll(event.target.scrollLeft, initDate)
        props.scrollHour(newCenterHour)
      })
    return scrollSubscript
  }

  const mouseMoveRxRef = useRef(null)
  function handleDrag(mouseDown, mouseUp) {
    let dragSubscript = Rx.Observable.merge(mouseDown, mouseUp)
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
    return dragSubscript
  }

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

