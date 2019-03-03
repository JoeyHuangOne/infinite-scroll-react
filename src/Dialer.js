import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useReducer } from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction, dragMoveHourAction, dragEndHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js"
import * as Rx from 'rxjs/Rx';
import useRxRef from './useRx.js'

let Dialer = React.memo(props => {
  let start2currentHour = Math.floor(props.totalHours / 2)
  let visible2currentHour = Math.floor(props.visibleHours / 2)
  let dialerRef = useRef()

  const [initDateRxRef, initDateRxNext] = useRxRef(props.initDate)
  const hours = useMemo(() => fillHours(props.initDate), [props.initDate])
  const scrollRx = useRef(null)
  const mouseMoveRxRef = useRef(null)
  const dragRxRef = useRef(null)

  const [resizeUpdate, forceUpdate] = useReducer(x => x + 1, 0);
  const [resizeCenter, setResizeCenter] = useState(resizeUpdate)

  useLayoutEffect(() => {
    initDateRxNext(props.initDate)
    if (props.center || resizeUpdate !== resizeCenter) centerDialer()
    setResizeCenter(resizeUpdate)
  })

  useEffect(() => {
    function resize() {
      forceUpdate()
    }
    window.addEventListener("resize", resize)
    return () => { window.removeEventListener("resize", resize) }
  }, [])

  //for scroll
  useEffect(() => {
    if (scrollRx.current) return

    let mouseUp = Rx.Observable.fromEvent(dialerRef.current, 'mouseup')
    let mouseDown = Rx.Observable.fromEvent(dialerRef.current, 'mousedown')
    let mouseUpDwon = Rx.Observable.merge(mouseDown, mouseUp).startWith({})
    scrollRx.current = Rx.Observable
      .fromEvent(dialerRef.current, 'scroll')
      .throttleTime(15)
      .withLatestFrom(initDateRxRef.current, mouseUpDwon)
      .subscribe(events => {
        let event = events[0], initDate = events[1]
        let mouseUpDown = events[2]
        if (mouseUpDown.buttons === 1 && mouseUpDown.type === 'mousedown') return
        let newHour = convertX2Hour(event.target.scrollLeft, initDate)
        let hourDiff = diffHour(newHour, initDate)
        scrollByHour(-hourDiff)
        props.scrollHour(newHour)
      });

    return () => {
      scrollRx.current.unsubscribe();
      scrollRx.current = null
    }
  }, [])

  // for drag
  useEffect(() => {
    if (dragRxRef.current) return

    let mouseUp = Rx.Observable.fromEvent(dialerRef.current, 'mouseup')
    let mouseDown = Rx.Observable
      .fromEvent(dialerRef.current, 'mousedown')
    Rx.Observable.merge(mouseDown, mouseUp)
      .withLatestFrom(initDateRxRef.current)
      .subscribe(events => {
        let event = events[0]
        if (event.type === 'mousedown' && event.buttons === 1) {
          let dragStartHour = events[1]
          let dragStartPosX = event.clientX
          let dragStartScoll = dialerRef.current.scrollLeft
          mouseMoveRxRef.current = Rx.Observable
            .fromEvent(dialerRef.current, 'mousemove')
            .throttleTime(15)
            .subscribe(event => {
              if (event.buttons !== 1) {
                mouseMoveRxRef.current.unsubscribe()
                mouseMoveRxRef.current = null
              }
              else {
                let mouseDiff = dragStartPosX - event.clientX
                let scroll = dragStartScoll + mouseDiff
                dialerRef.current.scrollLeft = scroll
                let newHour = convertX2Hour(scroll, dragStartHour)
                props.dragMoveHour(newHour)
              }
            })
        } else if (event.type === 'mouseup') {
          mouseMoveRxRef.current.unsubscribe()
          mouseMoveRxRef.current = null
        }
      })

    return () => {
      dragRxRef.current.unsubscribe();
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

  function renderHours() {
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
      <div className='hourContainer' id='hourContainer'
        //onMouseMove={mouseMove}
        //onMouseDown={mouseDown}
        //onMouseUp={mouseUp}
        ref={dialerRef}
      >
        {renderHours()}
      </div>
    </div>
  );
})

function plusHour(date, hour = 0) {
  let newDate = date.valueOf()
  newDate += hour * 3600000
  let retDate = new Date(newDate)
  return retDate
}

function diffHour(newTime, orgTime) {
  let newHour = new Date(newTime)
  newHour.setHours(newHour.getHours(), 0, 0, 0)
  let orgHour = new Date(orgTime)
  orgHour.setHours(orgHour.getHours(), 0, 0, 0)
  let diff = newHour.valueOf() - orgHour.valueOf()
  return diff / 3600000
}

Dialer.propTypes = {
  initDate: PropTypes.instanceOf(Date),
  center: PropTypes.bool,
  visibleHours: PropTypes.number,
  totalHours: PropTypes.number,
  scrollHour: PropTypes.func,
  changeDate: PropTypes.func,
  dragMoveHour: PropTypes.func,
  dragEndHour: PropTypes.func,
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
    dragEndHour: (newHour) => {
      dispatch(dragEndHourAction(newHour));
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialer);

