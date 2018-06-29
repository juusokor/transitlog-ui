import React, {Component} from 'react';
import './App.css';
import {LeafletMap} from './LeafletMap';
import {FilterPanel} from './FilterPanel';
import {ApolloProvider} from 'react-apollo';
import {joreClient, digiTClient, hfpClient } from '../api';


class App extends Component {
  
  constructor() {
    super();
    this.state = {
      date: '2018-05-07',
      selectedLine: {lineId: '1006', dateBegin: '2017-08-14', dateEnd: '2018-12-31'},
      startTime: '11:55',
      selectedRoute: {lineId: '1006', direction: '1', dateBegin: '2017-08-14', dateEnd: '2018-12-31'},
    };
  }

  onDateSelected = (date) => {
    this.setState({date});
  };

  onLineSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({selectedLine: {lineId, dateBegin, dateEnd}});
  };

  render() {
    return (
    <ApolloProvider client={joreClient}>  
      <div className="transitlog">
        <FilterPanel date={this.state.date} onDateSelected={this.onDateSelected} selectedLine={this.state.selectedLine} onLineSelected={this.onLineSelected} selectedRoute={this.state.selectedRoute}/>
        <LeafletMap selectedRoute={this.state.selectedRoute} date={this.state.date} startTime={this.state.startTime}/>
      </div>
    </ApolloProvider>
    )
  }
}

export default App
