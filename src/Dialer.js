import React from 'react';
import PropTypes from 'prop-types'
import { newDateAction, newDateHourAction, scrollHourAction } from './actions'
import { connect } from 'react-redux'
import DialerHour from './DialerHour.js'
import './Dialer.css'
import DialerDate from "./DialerDate.js";
import { dateChange, dateHourChange, scrollHour } from './ActionConst.js'


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
    this.orgCurrentHour = currentHour
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

  scroll = event => {
    let newHour = this.convertX2Hour(this.dialerRef.current.scrollLeft)
    let hourDiff = this.diffHour(newHour, this.orgCurrentHour)
    if (hourDiff > 1 || hourDiff < -1) {
      this.scrollByHour(-hourDiff)
      let newHours = this.fillHours(newHour)
      this.setState({ currentHour: newHour, hours: newHours })
      this.props.scrollHour(newHour)
    } else {
      this.setState({ currentHour: newHour })
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
        <div className='hourContainer' id='hourContainer' ref={this.dialerRef}
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
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialer);

