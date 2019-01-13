import React from 'react';
import PropTypes from 'prop-types'
import { newDateAction } from './actions'
import { connect } from 'react-redux'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

class DialerDate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentDate: this.props.currentDate || Date.now() };
  }

  handleChange = (newDate) => {
    this.props.changeDate(newDate)
    this.setState({
      currentDate: newDate
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentDate && prevProps.currentDate !== this.props.currentDate) {
      let newDate = new Date(this.props.currentDate)
      this.setState({ currentDate: newDate })
    }
  }

  render() {
    return (
      <DatePicker
        selected={new Date(this.state.currentDate)}
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

