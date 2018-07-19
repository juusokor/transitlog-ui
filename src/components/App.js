import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import {ApolloProvider, Query} from "react-apollo";
import {joreClient, hfpClient} from "../api";
import moment from "moment";
import get from "lodash/get";
import gql from "graphql-tag";

const hfpQuery = gql`
  query hfpQuery(
    $routeId: String!
    $direction: Int!
    $startTime: Time!
    $date: Date!
  ) {
    allVehicles(
      orderBy: RECEIVED_AT_ASC
      condition: {
        routeId: $routeId
        directionId: $direction
        journeyStartTime: $startTime
        oday: $date
      }
    ) {
      nodes {
        nextStopId
        receivedAt
        lat
        long
        uniqueVehicleId
        acc
        spd
      }
    }
  }
`;

const routeQuery = gql`
  query routeQuery(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
  ) {
    route: routeByRouteIdAndDirectionAndDateBeginAndDateEnd(
      routeId: $routeId
      direction: $direction
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      geometries {
        nodes {
          geometry
        }
      }
      routeSegments {
        nodes {
          stop: stopByStopId {
            stopId
            lat
            lon
            shortId
            nameFi
            nameSe
          }
        }
      }
    }
  }
`;

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
      departureTime: "00:00",
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

  onChangeQueryTime = (queryTime) => {
    this.setState({queryTime});
  };

  onTimeSelected = (departureTime) => {
    this.setState({departureTime});
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
    const {route, departureTime, queryDate, stop, line, queryTime} = this.state;
    const {routeId, direction, dateBegin, dateEnd} = route;

    return (
      <ApolloProvider client={joreClient}>
        <Query
          client={hfpClient}
          query={hfpQuery}
          fetchPolicy="cache-and-network"
          variables={{
            routeId,
            direction: parseInt(direction),
            startTime: departureTime,
            date: queryDate,
          }}>
          {({loading: hfpLoading, error: hfpError, data}) => {
            const hfpPositions = get(data, "allVehicles.nodes", []);

            return (
              <Query
                query={routeQuery}
                fetchPolicy="cache-and-network"
                variables={{
                  routeId,
                  direction,
                  dateBegin,
                  dateEnd,
                }}>
                {({loading, error, data}) => {
                  const positions = get(
                    data,
                    "route.geometries.nodes[0].geometry.coordinates",
                    []
                  );

                  const stops = get(data, "route.routeSegments.nodes", []);

                  return (
                    <div className="transitlog">
                      <FilterPanel
                        queryDate={queryDate}
                        departureTime={departureTime}
                        queryTime={queryTime}
                        line={line}
                        route={route}
                        stop={stop}
                        onDateSelected={this.onDateSelected}
                        onTimeSelected={this.onTimeSelected}
                        onChangeQueryTime={this.onChangeQueryTime}
                        onLineSelected={this.onLineSelected}
                        onRouteSelected={this.onRouteSelected}
                        onStopSelected={this.onStopSelected}
                      />
                      <LeafletMap
                        routePositions={positions}
                        stops={stops}
                        hfpPositions={hfpPositions}
                        stop={stop}
                        departureTime={departureTime}
                        route={route}
                      />
                    </div>
                  );
                }}
              </Query>
            );
          }}
        </Query>
      </ApolloProvider>
    );
  }
}

export default App;
