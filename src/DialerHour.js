import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types'
import './DialerHour.css'
import { connect } from 'react-redux'
import { newDateHourAction } from './actions'

let DialerHour = React.memo(props => {
  const noDrag = useRef()

  const memoizedClick = useCallback(event => {
    if (!noDrag.current) return
    props.changeDateHour(props.currentHour)
  }, []);

  const memoizedMouseDown = useCallback(event => {
    noDrag.current = event.buttons === 1
  }, []);

  const memoizedMouseMove = useCallback(event => {
    noDrag.current = false
  }, []);

  return (
    <div onClick={memoizedClick}
      className={'hourCell'}
      onMouseMove={memoizedMouseMove}
      onMouseDown={memoizedMouseDown}
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
