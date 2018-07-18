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
      queryDate: "2018-05-06",
      queryTime: "00:00",
      line: {
        lineId: "",
        dateBegin: "",
        dateEnd: "",
      },
      route: {
        routeId: "",
        direction: "1",
        nameFi: "",
        dateBegin: "",
        dateEnd: "",
      },
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
            queryTime={this.state.queryTime}
            onDateSelected={this.onDateSelected}
            onTimeSelected={this.onTimeSelected}
            line={this.state.line}
            onLineSelected={this.onLineSelected}
            route={this.state.route}
            onRouteSelected={this.onRouteSelected}
          />
          <LeafletMap
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
