import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, useReducer } from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction, dragMoveHourAction, dragEndHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js"

// update from one br2
let Dialer = React.memo(props => {
  let start2currentHour = Math.floor(props.totalHours / 2)
  let visible2currentHour = Math.floor(props.visibleHours / 2)
  let dialerRef = useRef()

  const inDrag = useRef(0)
  const hours = useMemo(() => fillHours(props.initDate), [props.initDate])
  const dragRef = useRef({})

  const [resizeUpdate, forceUpdate] = useReducer(x => x + 1, 0);
  const [resizeCenter, setResizeCenter] = useState(resizeUpdate)

  useLayoutEffect(() => {
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

  const savedScroll = useCallback(event => {
    if (inDrag.current === 2) return
    let newHour = convertX2Hour(dialerRef.current.scrollLeft)
    let hourDiff = diffHour(newHour, props.initDate)
    if (hourDiff !== 0) {
      scrollByHour(-hourDiff)
      props.scrollHour(newHour)
    }
  }, [props.initDate])

  const mouseMove = useCallback(event => {
    if (event.buttons !== 1) inDrag.current = 0
    if (event.buttons === 1 && inDrag.current === 1) inDrag.current = 2
    if (inDrag.current === 2) {
      let mouseDiff = dragRef.current.dragStartPosX - event.clientX
      let scroll = dragRef.current.dragStartScoll + mouseDiff
      dialerRef.current.scrollLeft = scroll
      let newHour = convertX2Hour(scroll)
      props.dragMoveHour(newHour)
    }
  }, [props.initDate])

  const mouseUp = useCallback(event => {
    if (inDrag.current === 2) {
      let newHour = convertX2Hour(dialerRef.current.scrollLeft)
      let hourDiff = diffHour(newHour, dragRef.current.dragStartHour)
      hourDiff !== 0 && scrollByHour(-hourDiff)
      props.dragEndHour(newHour)
    }
    inDrag.current = 0
  }, [props.initDate])

  const mouseDown = useCallback(event => {
    inDrag.current = event.buttons === 1 ? 1 : 0
    dragRef.current.dragStartHour = props.initDate
    dragRef.current.dragStartPosX = event.clientX
    dragRef.current.dragStartScoll = dialerRef.current.scrollLeft
  }, [props.initDate])

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

  function convertX2Hour(scrollLeft) {
    let hourWidth = dialerRef.current.clientWidth / props.visibleHours
    let pointer = hourWidth * (props.visibleHours / 2) + scrollLeft
    let hourIdx = Math.floor(pointer / hourWidth)
    let newHour = hours[hourIdx]
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
        onMouseMove={mouseMove}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onScroll={savedScroll}
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

