import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import {ApolloProvider} from "react-apollo";
import {joreClient, digiTClient, hfpClient} from "../api";

class App extends Component {
  constructor() {
    super();
    this.state = {
      date: "2018-05-07",
      filter: {
        type: "line",
        lineId: "1006",
        dateBegin: "2017-08-14",
        dateEnd: "2018-12-31",
      },
      startTime: "11:55",
      route: {
        routeId: "1006",
        direction: "1",
        dateBegin: "2017-08-14",
        dateEnd: "2018-12-31",
      },
    };
  }

  onDateSelected = (date) => {
    this.setState({date});
  };

  onStartTimeSelected = (startTime) => {
    this.setState({startTime});
  };

  onRouteSelected = ({routeId, direction, dateBegin, dateEnd}) => {
    this.setState({route: {routeId, direction, dateBegin, dateEnd}});
  };

  render() {
    return (
      <ApolloProvider client={joreClient}>
        <div className="transitlog">
          <FilterPanel
            date={this.state.date}
            onDateSelected={this.onDateSelected}
            filter={this.state.filter}
            startTime={this.state.startTime}
            onStartTimeSelected={this.onStartTimeselected}
            route={this.state.route}
            onRouteSelected={this.onRouteSelected}
          />
          <LeafletMap
            date={this.state.date}
            startTime={this.state.startTime}
            route={this.state.route}
          />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
