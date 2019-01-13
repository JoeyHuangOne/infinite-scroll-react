import React from 'react';
import PropTypes from 'prop-types'
import { newDateAction, scrollHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js";
import { dateChange, dateHourChange, scrollHour } from './ActionConst.js'

const visibleHours = 11
const totalHours = visibleHours * 3

class Dialer extends React.Component {
  constructor(props) {
    super(props);
    this.totalCells = this.props.totalHours || totalHours
    this.visibleCells = this.props.visibleHours || visibleHours
    this.start2currentHour = Math.floor(this.totalCells / 2)
    this.visible2currentHour = Math.floor(this.visibleCells / 2)

    let newDate = this.props.initDate || new Date(Date.now())
    newDate = this.plusHour(newDate)
    this.state = {
      currentHour: newDate,
      inScroll: false,
      hours: this.fillHours(newDate)
    };
    this.dialerRef = React.createRef();
    this.inited = false
    this.inDrag = false
  }

  fillHours = (currentHour) => {
    let newHours = []
    this.orgCurrentHour = currentHour
    if (this.dialerRef)
      this.orgScrollLeft = this.dialerRef.current.scrollLeft
    for (var idx = 0; idx < this.totalCells; idx++) {
      let newDate = this.plusHour(currentHour, idx - this.start2currentHour)
      newHours.push(newDate)
    }
    return newHours
  }

  scrollByHour = hours => {
    let hoursWidth = this.dialerRef.current.clientWidth / this.visibleCells * hours
    this.dialerRef.current.scrollLeft += hoursWidth
  }

  componentDidMount() {
    this.centerDialer()
  }

  centerDialer = () => {
    let cellWidth = this.dialerRef.current.clientWidth / this.visibleCells
    this.dialerRef.current.scrollLeft = (this.start2currentHour - this.visible2currentHour) * cellWidth
  }

  plusHour = (date, hour = 0) => {
    let newDate = date.valueOf()
    newDate += hour * 3600000
    let retDate = new Date(newDate)
    return retDate
  }

  renderHours = () => {
    let hours = []
    let width = 100 / this.visibleCells + '%'
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

  componentDidUpdate(prevProps) {
    if (!this.props.initDate || prevProps.initDate === this.props.initDate) return

    if (this.props.changeType === dateChange) {
      let newDate = new Date(this.props.initDate)
      newDate.setHours(this.state.currentHour.getHours())
      this.setState({ currentHour: newDate, hours: this.fillHours(newDate) })

    } else if (this.props.changeType === dateHourChange) {
      let newDate = new Date(this.props.initDate)
      this.setState({ currentHour: newDate, hours: this.fillHours(newDate) })
      this.centerDialer()
    } else if (this.props.changeType === scrollHour) {
      let newDate = new Date(this.props.initDate)
      this.setState({ currentHour: newDate })
    }
  }

  mouseMove = event => {
    if (event.buttons !== 1) this.inDrag = false
    if (this.inDrag) {
      this.dialerRef.current.scrollBy(this.dragStartPos - event.clientX, 0)
      this.dragStartPos = event.clientX
    }
  }

  mouseUp = event => {
    this.inDrag = false
  }

  mouseDown = event => {
    this.inDrag = event.buttons === 1
    this.dragStartPos = event.clientX
  }

  convertX2Hour = scrollLeft => {
    let hourWidth = this.dialerRef.current.clientWidth / this.visibleCells
    let pointer = hourWidth * (this.visibleCells / 2) + scrollLeft
    let hourIdx = Math.floor(pointer / hourWidth)
    let newHour = this.state.hours[hourIdx]
    return newHour
  }

  scroll = event => {
    if (!this.inited) {
      this.inited = true
      return
    }

    let newHour = this.convertX2Hour(this.dialerRef.current.scrollLeft)
    let hourDiff = newHour.getHours() - this.orgCurrentHour.getHours()
    if (hourDiff > 1 || hourDiff < -1) {
      this.scrollByHour(-hourDiff)
      let newHours = this.fillHours(newHour)
      this.setState({ currentHour: newHour, hours: newHours })
      this.props.scrollHour(newHour)
    } else if (hourDiff === 1 || hourDiff === -1) {
      this.setState({ currentHour: newHour })
      this.props.scrollHour(newHour)
    }
  }

  render() {
    let curr = new Date(this.state.currentHour)
    let currStr = curr.toDateString() + ', hour ' + curr.getHours()
    console.log('current dialer: ' + currStr)
    return (
      <div>
        <DialerDate currentDate={this.state.currentHour} />
        <p></p>
        <div className='container' id='container' ref={this.dialerRef}
          onMouseMove={this.mouseMove}
          onMouseDown={this.mouseDown}
          onMouseUp={this.mouseUp}
          onScroll={this.scroll}
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
};

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
    }

  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialer);

