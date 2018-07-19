import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import {ApolloProvider} from "react-apollo";
import {joreClient} from "../api";
import moment from "moment";

const defaultStop = {
  stopId: "",
  shortId: "",
  lat: "",
  lon: "",
  nameFi: "",
  stopIndex: 0,
};

const defaultLine = {
  lineId: "1006T",
  dateBegin: "2017-08-14",
  dateEnd: "2050-12-31",
};

const defaultRoute = {
  routeId: "",
  direction: "",
  nameFi: "",
  dateBegin: "",
  dateEnd: "",
  originstopId: "",
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      queryDate: "2018-05-06",
      queryTime: "00:00",
      stop: defaultStop,
      line: defaultLine,
      route: defaultRoute,
    };
  }

  onDateSelected = (queryDate) => {
    this.setState({
      queryDate: moment(queryDate).format("YYYY-MM-DD"),
    });
  };

  onTimeSelected = (queryTime) => {
    this.setState({queryTime});
  };

  onRouteSelected = (route = defaultRoute) => {
    // route might be null (default arg only catches undefined)
    const setRoute = route || defaultRoute;

    this.setState({
      route: setRoute,
    });
  };

  onLineSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({
      line: {
        lineId,
        dateBegin,
        dateEnd,
      },
      // Clear stop selection when line changes.
      stop: lineId !== this.state.line.lineId ? defaultStop : undefined,
    });
  };

  onStopSelected = (stop) => {
    this.setState({
      stop,
    });
  };

  render() {
    return (
      <ApolloProvider client={joreClient}>
        <div className="transitlog">
          <FilterPanel
            queryDate={this.state.queryDate}
            queryTime={this.state.queryTime}
            onDateSelected={this.onDateSelected}
            onTimeSelected={this.onTimeSelected}
            line={this.state.line}
            onLineSelected={this.onLineSelected}
            route={this.state.route}
            onRouteSelected={this.onRouteSelected}
            stop={this.state.stop}
            onStopSelected={this.onStopSelected}
          />
          <LeafletMap
            stop={this.state.stop}
            queryDate={this.state.queryDate}
            queryTime={this.state.queryTime}
            route={this.state.route}
          />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
