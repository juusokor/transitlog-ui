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
import takeEveryNth from "./helpers/takeEveryNth";
import * as JSONC from "./helpers/JSONC";

const defaultRoute = {
  routeId: "",
  direction: "",
  nameFi: "",
  dateBegin: "",
  dateEnd: "",
  originstopId: "",
};

const defaultLine = {
  lineId: "1006T",
  dateBegin: "2017-08-14",
  dateEnd: "2050-12-31",
};

const hfpCache = {};

class Root extends Component {
  state = {
    queryDate: "2018-05-06",
    route: defaultRoute,
    line: defaultLine,
  };

  onDateSelected = (queryDate) => {
    this.setState({
      queryDate: moment(queryDate).format("YYYY-MM-DD"),
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

  onRouteSelected = (route = defaultRoute) => {
    // route might be null (default arg only catches undefined)
    const setRoute = route || defaultRoute;

    this.setState({
      route: setRoute,
    });
  };

  formatHfpData = (hfpData) => {
    if (!hfpData || hfpData.length === 0) {
      return hfpData;
    }

    let data = orderBy(hfpData, "receivedAt");
    data = groupBy(data, "uniqueVehicleId");
    data = map(data, (positions, groupName) => ({
      groupName: groupName,
      positions: takeEveryNth(positions, 10).filter(
        (pos) => !!pos.lat && !!pos.long
      ),
    }));

    return data;
  };

  cachePositions = (hfpData) => {
    if (!hfpData || hfpData.length === 0) {
      return;
    }

    const {queryDate, route} = this.state;
    const key = `${queryDate}.${route.routeId}.${route.direction}`;

    const data = JSONC.pack(hfpData, true); // Compress json

    try {
      window.localStorage.setItem(key, data);
    } catch (e) {
      window.localStorage.clear();
      window.localStorage.setItem(key, data);
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

    return JSONC.unpack(stored, true);
  };

  getAppContent = (hfpPositions = [], loading = false) => (
    <App
      loading={loading}
      hfpPositions={hfpPositions}
      route={this.state.route}
      line={this.state.line}
      queryDate={this.state.queryDate}
      onRouteSelected={this.onRouteSelected}
      onLineSelected={this.onLineSelected}
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
            {({hfpPositions, loading}) => {
              if (loading) {
                return this.getAppContent([], true);
              }

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
