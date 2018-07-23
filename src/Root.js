import React, {Component} from "react";
import HfpQuery from "./queries/HfpQuery";
import moment from "moment";
import App from "./components/App";
import {joreClient} from "./api";
import {ApolloProvider} from "react-apollo";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import set from "lodash/set";
import takeEveryNth from "./helpers/takeEveryNth";

const defaultRoute = {
  routeId: "",
  direction: "",
  nameFi: "",
  dateBegin: "",
  dateEnd: "",
  originstopId: "",
};

const hfpCache = {};

class Root extends Component {
  state = {
    queryDate: "2018-05-06",
    route: defaultRoute,
  };

  onDateSelected = (queryDate) => {
    this.setState({
      queryDate: moment(queryDate).format("YYYY-MM-DD"),
    });
  };

  onRouteSelected = (route = defaultRoute) => {
    // route might be null (default arg only catches undefined)
    const setRoute = route || defaultRoute;

    this.setState({
      route: setRoute,
    });
  };

  formatHfpData = (hfpData) => {
    let data = orderBy(hfpData, (pos) => moment(pos.receivedAt).unix());
    data = groupBy(data, "uniqueVehicleId");
    data = map(data, (positions, groupName) => ({
      groupName: groupName,
      positions: takeEveryNth(positions, 10),
    }));

    return data;
  };

  cachePositions = (hfpData, overwrite = false) => {
    const {queryDate, route} = this.state;
    const cachedDate = get(hfpCache, queryDate, {});
    const cachedRoute = get(cachedDate, route.routeId, []);

    if (overwrite || cachedRoute.length === 0) {
      window.localStorage.setItem(
        `${queryDate}.${route.routeId}.${route.direction}`,
        JSON.stringify(hfpData)
      );
    }
  };

  getCachedPositions = () => {
    const {queryDate, route} = this.state;
    const stored = window.localStorage.getItem(
      `${queryDate}.${route.routeId}.${route.direction}`
    );

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  };

  getAppContent = (hfpPositions = []) => (
    <App
      hfpPositions={hfpPositions}
      route={this.state.route}
      queryDate={this.state.queryDate}
      onRouteSelected={this.onRouteSelected}
      onDateSelected={this.onDateSelected}
    />
  );

  render() {
    const {route, queryDate} = this.state;
    let hfpPositions = this.getCachedPositions();

    return (
      <ApolloProvider client={joreClient}>
        {hfpPositions.length === 0 ? (
          <HfpQuery route={route} queryDate={queryDate}>
            {({hfpPositions}) => {
              const formattedPositions = this.formatHfpData(hfpPositions);
              this.cachePositions(formattedPositions);
              return this.getAppContent(formattedPositions);
            }}
          </HfpQuery>
        ) : (
          this.getAppContent(hfpPositions)
        )}
      </ApolloProvider>
    );
  }
}

export default Root;
