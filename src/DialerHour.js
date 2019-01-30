import React from 'react';
import PropTypes from 'prop-types'
import './DialerHour.css'
import { connect } from 'react-redux'
import { newDateHourAction } from './actions'

export class DialerHour extends React.PureComponent {
  click = event => {
    if (this.inDrag) return
    this.props.changeDateHour(this.props.currentHour)
  }

  mouseMove = event => {
    this.inDrag = event.buttons >= 1
  }

  render() {
    let hour = new Date(this.props.currentHour).getHours()
    return (
      <div onClick={this.click}
        className={'hourCell'}
        onMouseMove={this.mouseMove}
        style={{ width: this.props.cellWidth }}
      >
        <div className='hourText'>
          {hour}
        </div>
      </div>
    );
  }
}

DialerHour.propTypes = {
  currentHour: PropTypes.instanceOf(Date).isRequired,
  cellWidth: PropTypes.string.isRequired,
  changeDateHour: PropTypes.func,
};


const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    changeDateHour: (newHour) => {
      dispatch(newDateHourAction(newHour));
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(DialerHour);

