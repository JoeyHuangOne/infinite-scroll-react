import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction, dragMoveHourAction, dragEndHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js"

function Dialer(props) {
  let start2currentHour = Math.floor(props.totalHours / 2)
  let visible2currentHour = Math.floor(props.visibleHours / 2)
  let dialerRef = React.createRef();

  const [inDrag, setInDrag] = useState(0)
  const [dragStartHour, setDragStartHour] = useState()
  const [dragStartPosX, setDragStartPosX] = useState()
  const [dragStartScoll, setDragStartScoll] = useState()
  const [addResize, setAddResize] = useState(0)

  useEffect(() => {
    if (addResize === 0) {
      console.log()
      window.addEventListener("resize",
        () => { props.changeDateHour(props.initDate) })
      setAddResize(1)
    }
    props.center && centerDialer()
  })

  function scrollByHour(hours) {
    let hoursWidth = dialerRef.current.clientWidth / props.visibleHours * hours
    dialerRef.current.scrollLeft += hoursWidth
  }

  function centerDialer() {
    let cellWidth = dialerRef.current.clientWidth / props.visibleHours
    dialerRef.current.scrollLeft = (start2currentHour - visible2currentHour) * cellWidth
  }


  function plusHour(date, hour = 0) {
    let newDate = date.valueOf()
    newDate += hour * 3600000
    let retDate = new Date(newDate)
    return retDate
  }

  function mouseMove(event) {
    if (event.buttons !== 1) setInDrag(0)
    if (event.buttons === 1 && inDrag === 1) setInDrag(2)
    if (inDrag === 2) {
      let mouseDiff = dragStartPosX - event.clientX
      let scroll = dragStartScoll + mouseDiff
      //console.log(`drag scroll lef ${scroll}`)
      dialerRef.current.scrollLeft = scroll
      let newHour = convertX2Hour(scroll)
      props.dragMoveHour(newHour)
    }
  }

  function mouseUp(event) {
    if (inDrag === 2) {
      let newHour = convertX2Hour(dialerRef.current.scrollLeft)
      let hourDiff = diffHour(newHour, dragStartHour)
      hourDiff !== 0 && scrollByHour(-hourDiff)
      props.dragEndHour(newHour)
    }
    setInDrag(0)
  }

  function mouseDown(event) {
    setInDrag(event.buttons === 1 ? 1 : 0)
    setDragStartHour(props.initDate)
    setDragStartPosX(event.clientX)
    setDragStartScoll(dialerRef.current.scrollLeft)
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
    let newHour = plusHour(props.initDate, hourIdx - start2currentHour)
    return newHour
  }

  function diffHour(newTime, orgTime) {
    let newHour = new Date(newTime)
    newHour.setHours(newHour.getHours(), 0, 0, 0)
    let orgHour = new Date(orgTime)
    orgHour.setHours(orgHour.getHours(), 0, 0, 0)
    let diff = newHour.valueOf() - orgHour.valueOf()
    return diff / 3600000
  }

  function scroll(event) {
    if (inDrag === 2) return
    let newHour = convertX2Hour(dialerRef.current.scrollLeft)
    let hourDiff = diffHour(newHour, props.initDate)
    if (hourDiff !== 0) {
      scrollByHour(-hourDiff)
      props.scrollHour(newHour)
    }
  }

  function renderHours() {
    let hours = fillHours(props.initDate)
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
        onScroll={scroll}
        ref={dialerRef}
      >
        {renderHours()}
      </div>
    </div>
  );

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
};

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

