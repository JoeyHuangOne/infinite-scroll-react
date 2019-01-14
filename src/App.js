import React, { Component } from 'react';
import './App.css';
import Dialer from "./Dialer.js";
import { connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  render() {
    let hourStr
    if (this.props.currentHour) {
      hourStr = this.props.currentHour.toDateString() + ', hour ' + this.props.currentHour.getHours()
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
}

const mapStateToProps = function (state) {
  return { currentHour: state.dateReducer.currentHour };
}

export default connect(
  mapStateToProps
)(App);

