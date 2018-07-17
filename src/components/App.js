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
      queryDate: "2018-07-17",
      line: {
        lineId: "",
        dateBegin: "",
        dateEnd: "",
      },
      startTime: "11:55",
      route: {
        routeId: "",
        direction: "1",
        nameFi: "",
        dateBegin: "",
        dateEnd: "",
      },
    };
  }

  onDateSelected = (dateBegin, dateEnd = null) => {
    this.setState({
      dateBegin: moment(dateBegin).format("YYYY-MM-DD"),
      dateEnd: dateEnd
        ? moment(dateEnd).format("YYYY-MM-DD")
        : moment(dateBegin)
            .add(1, "days")
            .format("YYYY-MM-DD"),
    });
  };

  onStartTimeSelected = (startTime) => {
    this.setState({startTime});
  };

  onRouteSelected = (route) => {
    // route might be null
    const {
      routeId = "",
      direction = "1",
      nameFi = "",
      dateBegin = "",
      dateEnd = "",
    } = route;

    this.setState({
      route: {
        routeId,
        direction,
        nameFi,
        dateBegin,
        dateEnd,
      },
    });
  };

  onLineSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({
      line: {
        lineId,
        dateBegin,
        dateEnd,
      },
    });
  };

  render() {
    return (
      <ApolloProvider client={joreClient}>
        <div className="transitlog">
          <FilterPanel
            queryDate={this.state.queryDate}
            onDateSelected={this.onDateSelected}
            startTime={this.state.startTime}
            onStartTimeSelected={this.onStartTimeSelected}
            line={this.state.line}
            onLineSelected={this.onLineSelected}
            route={this.state.route}
            onRouteSelected={this.onRouteSelected}
          />
          <LeafletMap
            queryDate={this.state.queryDate}
            startTime={this.state.startTime}
            route={this.state.route}
          />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
