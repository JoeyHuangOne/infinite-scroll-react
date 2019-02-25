import React from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction, dragMoveHourAction, dragEndHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js";
import { dateChange, dateHourChange, scrollHour, dragEndHour } from './ActionConst.js'
import * as Rx from 'rxjs/Rx';

export class Dialer extends React.Component {
  constructor(props) {
    super(props);
    this.start2currentHour = Math.floor(this.props.totalHours / 2)
    this.visible2currentHour = Math.floor(this.props.visibleHours / 2)

    let newDate = this.props.initDate || new Date(Date.now())
    newDate = this.plusHour(newDate)
    this.state = {
      currentHour: newDate,
      hours: this.fillHours(newDate)
    };
    this.dialerRef = React.createRef();
    this.inDrag = false
  }

  fillHours = (currentHour) => {
    let newHours = []
    if (this.dialerRef)
      this.orgScrollLeft = this.dialerRef.current.scrollLeft
    for (var idx = 0; idx < this.props.totalHours; idx++) {
      let newDate = this.plusHour(currentHour, idx - this.start2currentHour)
      newHours.push(newDate)
    }
    return newHours
  }

  scrollByHour = hours => {
    let hoursWidth = this.dialerRef.current.clientWidth / this.props.visibleHours * hours
    this.dialerRef.current.scrollLeft += hoursWidth
  }

  componentDidMount() {
    window.addEventListener("resize", () => {
      this.props.changeDateHour(this.state.currentHour)
    });
    this.centerDialer()
    this.subscribeScoll()
  }

  componentWillUnmount() {
    this.unsubscribeScoll()
  }

  centerDialer = () => {
    let cellWidth = this.dialerRef.current.clientWidth / this.props.visibleHours
    this.dialerRef.current.scrollLeft = (this.start2currentHour - this.visible2currentHour) * cellWidth
  }

  plusHour = (date, hour = 0) => {
    let newDate = date.valueOf()
    newDate += hour * 3600000
    let retDate = new Date(newDate)
    return retDate
  }

  sameDayHour = (time1, time2) => {
    let same = time1.toDateString() === time2.toDateString()
    same = same && time1.getHours() === time2.getHours()
    return same
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.sameDayHour(this.props.initDate, nextProps.initDate) || this.props.changeType !== nextProps.changeType || !this.sameDayHour(this.state.currentHour, nextState.currentHour)
  }

  componentDidUpdate(prevProps) {
    if (!this.props.initDate || (this.sameDayHour(prevProps.initDate, this.props.initDate) && this.props.changeType === prevProps.changeType)) return

    if (this.props.changeType === dateChange) {
      let newDate = new Date(this.props.initDate)
      newDate.setHours(this.state.currentHour.getHours())
      this.setState({ currentHour: newDate, hours: this.fillHours(newDate) })

    } else if (this.props.changeType === dateHourChange) {
      let newDate = new Date(this.props.initDate)
      this.setState({ currentHour: newDate, hours: this.fillHours(newDate) })
      this.centerDialer()
      console.log('center')
    } else if (this.props.changeType === scrollHour || this.props.changeType === dragEndHour) {
      let newDate = new Date(this.props.initDate)
      //console.log(`fill hour ${newDate}`)
      this.setState({ currentHour: newDate, hours: this.fillHours(newDate) })
    }
  }

  mouseMove = event => {
    if (event.buttons !== 1) this.inDrag = false
    if (this.inDrag) {
      let mouseDiff = this.dragStartPosX - event.clientX
      let scroll = this.dragStartScoll + mouseDiff
      //console.log(`x sl md s ${event.clientX} ${this.dialerRef.current.scrollLeft} ${mouseDiff} ${scroll}`)
      this.dialerRef.current.scrollLeft = scroll
      let newHour = this.convertX2Hour(scroll)
      this.props.dragMoveHour(newHour)
    }
  }

  mouseUp = event => {
    if (this.inDrag) {
      let newHour = this.convertX2Hour(this.dialerRef.current.scrollLeft)
      let hourDiff = this.diffHour(newHour, this.dragStartHour)
      hourDiff !== 0 && this.scrollByHour(-hourDiff)
      this.props.dragEndHour(newHour)
    }
    this.inDrag = false
  }

  mouseDown = event => {
    this.inDrag = event.buttons === 1
    this.dragStartHour = this.props.initDate
    this.dragStartPosX = event.clientX
    this.dragStartScoll = this.dialerRef.current.scrollLeft
    //console.log(`mouse/scroll pos ${this.dragStartPos} ${this.dragStartScoll}`)
  }

  convertX2Hour = scrollLeft => {
    let hourWidth = this.dialerRef.current.clientWidth / this.props.visibleHours
    let pointer = hourWidth * (this.props.visibleHours / 2) + scrollLeft
    let hourIdx = Math.floor(pointer / hourWidth)
    let newHour = this.state.hours[hourIdx]
    return newHour
  }

  diffHour = (newTime, orgTime) => {
    let newHour = new Date(newTime)
    newHour.setHours(newHour.getHours(), 0, 0, 0)
    let orgHour = new Date(orgTime)
    orgHour.setHours(orgHour.getHours(), 0, 0, 0)
    let diff = newHour.valueOf() - orgHour.valueOf()
    return diff / 3600000
  }

  subscribeScoll = () => {
    //console.log(`ref ${this.dialerRef}`)
    this.scrollUnsubscribe = Rx.Observable
      .fromEvent(this.dialerRef.current, 'scroll')
    //.subscribe(event => console.log(`scroll left ${event.target.scrollLeft}`))
  }

  unsubscribeScroll = () => {
    this.scrollUnsubscribe()
  }

  scroll = event => {
    if (this.inDrag) return
    let newHour = this.convertX2Hour(this.dialerRef.current.scrollLeft)
    let hourDiff = this.diffHour(newHour, this.props.initDate)
    if (hourDiff !== 0) {
      console.log(`scroll hour ${hourDiff}`)
      !this.inDrag && this.scrollByHour(-hourDiff)
      this.props.scrollHour(newHour)
    }
  }

  renderHours = () => {
    let hours = []
    let width = 100 / this.props.visibleHours + '%'
    this.state.hours.forEach(hour => {
      hours.push(
        <DialerHour
          key={hour.valueOf()}
          cellWidth={width}
          currentHour={hour}
        />
      )
    })
    return hours
  }

  render() {
    let curr = new Date(this.state.currentHour)
    let currStr = curr.toDateString() + ', hour ' + curr.getHours()
    console.log('current dialer: ' + currStr)
    return (
      <div>
        <DialerDate currentDate={this.state.currentHour} />
        <p></p>
        <div className='hourContainer' id='hourContainer'
          onMouseMove={this.mouseMove}
          onMouseDown={this.mouseDown}
          onMouseUp={this.mouseUp}
          onScroll={this.scroll}
          ref={this.dialerRef}
        >
          {this.renderHours()}
        </div>
      </div>
    );
  }
}

Dialer.propTypes = {
  initDate: PropTypes.instanceOf(Date),
  changeType: PropTypes.string,
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
}

const mapStateToProps = function (state) {
  return {
    initDate: state.dateReducer.currentHour,
    changeType: state.dateReducer.changeType
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

