import React from 'react';
import PropTypes from 'prop-types'
import './DialerHour.css'
import { connect } from 'react-redux'
import { newDateHourAction } from './actions'

class DialerHour extends React.Component {
  click = event => {
    console.log('click ' + this.props.currentHour)
    this.props.changeDateHour(this.props.currentHour)
  }

  render() {
    let hour = new Date(this.props.currentHour).getHours()
    return (
      <div onClick={this.click} className={'hourCell'}
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
  currentHour: PropTypes.instanceOf(Date),
  cellWidth: PropTypes.string,
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

