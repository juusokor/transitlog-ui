import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import {ApolloProvider} from "react-apollo";
import {joreClient, digiTClient, hfpClient} from "../api";
import moment from "moment";

class App extends Component {
  constructor() {
    super();
    this.state = {
      dateBegin: "2018-07-17",
      dateEnd: "2018-07-20",
      line: "1006",
      startTime: "11:55",
      route: {
        routeId: "1006",
        direction: "1",
      },
    };
  }

  onDateSelected = (dateBegin, dateEnd = null) => {
    this.setState({
      dateBegin: moment(dateBegin).format("YYYY-MM-DD"),
      dateEnd:
        dateEnd ||
        moment(dateBegin)
          .add(1, "days")
          .format("YYYY-MM-DD"),
    });
  };

  onStartTimeSelected = (startTime) => {
    this.setState({startTime});
  };

  onRouteSelected = ({routeId, direction, dateBegin, dateEnd}) => {
    this.setState({
      route: {routeId, direction},
      dateBegin,
      dateEnd,
    });
  };

  onLineSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({
      line: lineId,
      dateBegin,
      dateEnd,
    });
  };

  render() {
    return (
      <ApolloProvider client={joreClient}>
        <div className="transitlog">
          <FilterPanel
            dateBegin={this.state.dateBegin}
            dateEnd={this.state.dateEnd}
            onDateSelected={this.onDateSelected}
            startTime={this.state.startTime}
            onStartTimeSelected={this.onStartTimeSelected}
            line={this.state.line}
            onLineSelected={this.onLineSelected}
            route={this.state.route}
            onRouteSelected={this.onRouteSelected}
          />
          <LeafletMap
            dateBegin={this.state.dateBegin}
            dateEnd={this.state.dateEnd}
            startTime={this.state.startTime}
            route={this.state.route}
          />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
