import React, { Component } from 'react';
import logo from '../hsl-logo.png';
import './App.css';
import { LeafletMap } from './LeafletMap'

class App extends Component {

  render() {
    return (
      <div className="transitlog">
        <header className="transitlog-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
        </header>
        <LeafletMap />
      </div>
    );
  }
}

export default App;
