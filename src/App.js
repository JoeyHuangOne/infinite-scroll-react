import React from 'react';
import './App.css';
import Dialer from "./Dialer.js";
import { connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';

let App = React.memo(props => {
  let hourStr
  if (props.currentHour) {
    hourStr = props.currentHour.toDateString() + ', hour ' + props.currentHour.getHours()
  }
  return (
    <div className="App">
      <div className="jumbotron">
        <h1>Dialer example</h1>
        <p>Scroll, clik, or drag the dialer to change hour.</p>
      </div>
      <Dialer />
      <span className='alert-warning'>current dialer: {hourStr}</span>
    </div>
  );
}
)

const mapStateToProps = function (state) {
  return { currentHour: state.dateReducer.currentHour };
}

export default connect(
  mapStateToProps
)(App);

