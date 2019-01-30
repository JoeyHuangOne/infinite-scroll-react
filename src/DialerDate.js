import React from 'react';
import PropTypes from 'prop-types'
import { newDateAction } from './actions'
import { connect } from 'react-redux'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

class DialerDate extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newDate) {
    this.props.changeDate(newDate)
  }

  render() {
    return (
      <DatePicker
        selected={new Date(this.props.currentDate)}
        onChange={this.handleChange}
      />
    );
  }
}

DialerDate.propTypes = {
  currentDate: PropTypes.instanceOf(Date),
  changeDate: PropTypes.func,
};

const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    changeDate: (newDate) => {
      dispatch(newDateAction(newDate));
    }
  }
}

export default connect(
  null,
  mapDispatchToProps
)(DialerDate);

