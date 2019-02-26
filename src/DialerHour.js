import React, { useState } from 'react';
import PropTypes from 'prop-types'
import './DialerHour.css'
import { connect } from 'react-redux'
import { newDateHourAction } from './actions'

let DialerHour = React.memo(props => {
  const [noDrag, setNoDrag] = useState(false)

  function click(event) {
    if (!noDrag) return
    props.changeDateHour(props.currentHour)
  }

  function mouseMove(event) {
    setNoDrag(false)
  }

  function mouseDown(event) {
    setNoDrag(event.buttons === 1)
  }

  return (
    <div onClick={click}
      className={'hourCell'}
      onMouseMove={mouseMove}
      onMouseDown={mouseDown}
      style={{ width: props.cellWidth }}
    >
      <div className='hourText'>
        {new Date(props.currentHour).getHours()}
      </div>
    </div>
  )
})

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
