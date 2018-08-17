import React, { Component } from 'react';
import { data } from './data';
import './App.css';
import Viz from './Viz/Viz';
import CssBaseline from '@material-ui/core/CssBaseline';

class App extends Component {
  state = {
    data: data
  };
  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <Viz data={data} />
      </React.Fragment>
    );
  }
}

export default App;
