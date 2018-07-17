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
      startTime: "11:55",
      selectedRoute: {
        lineId: "1006",
        direction: "2",
        dateBegin: "2017-08-14",
        dateEnd: "2018-12-31",
      },
    };
  }

  onRouteSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({selectedRoute: {lineId, dateBegin, dateEnd}});
  };

  render() {
    return (
      <ApolloProvider client={joreClient}>
        <div className="transitlog">
          <FilterPanel
            selectedRoute={this.state.selectedRoute}
            onRouteSelected={this.onRouteSelected}
          />
          <LeafletMap selectedRoute={this.state.selectedRoute} />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
