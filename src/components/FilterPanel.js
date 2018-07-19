import React, {Component} from "react";
import logo from "../hsl-logo.png";
import "./FilterPanel.css";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import {RouteInput} from "./RouteInput";
import QueryRoutesByLine from "./QueryRoutesByLine";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {DateInput} from "./DateInput";
import get from "lodash/get";
import uniq from "lodash/uniq";
import moment from "moment";

const allStopsQuery = gql`
  query allStopsQuery {
    allStops {
      nodes {
        stopId
        shortId
        lat
        lon
        nameFi
      }
    }
  }
`;

const stopsByRouteQuery = gql`
  query stopsByRoute(
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
      routeSegments {
        nodes {
          stop: stopByStopId {
            stopId
            lat
            lon
            shortId
            nameFi
          }
        }
      }
    }
  }
`;

const allLinesQuery = gql`
  query AllLinesQuery {
    allLines {
      nodes {
        lineId
        nameFi
        dateBegin
        dateEnd
        routes {
          totalCount
        }
      }
    }
  }
`;

const departuresQuery = gql`
  query startTimesQuery(
    $stopId: String
    $routeId: String
    $direction: String
    $dayType: String
  ) {
    allDepartures(
      condition: {
        stopId: $stopId
        routeId: $routeId
        direction: $direction
        dayType: $dayType
      }
    ) {
      nodes {
        stopId
        routeId
        departureId
        hours
        minutes
        dateBegin
        dateEnd
      }
    }
  }
`;

const removeFerryFilter = (line) => line.lineId.substring(0, 4) !== "1019";

// Zero-indexed and sunday first because that's the most reliable number we get from moment.
const dayTypes = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

function padNumber(number, length) {
  return (number + "").padStart(length, "0");
}

const transportTypeOrder = ["tram", "bus"];
const linesSorter = (a, b) => {
  if (a.transportType !== b.transportType) {
    return transportTypeOrder.indexOf(a.transportType) >
      transportTypeOrder.indexOf(b.transportType)
      ? 1
      : -1;
  } else if (a.lineId.substring(1, 4) !== b.lineId.substring(1, 4)) {
    return a.lineId.substring(1, 4) > b.lineId.substring(1, 4) ? 1 : -1;
  } else if (a.lineId.substring(0, 1) !== b.lineId.substring(0, 1)) {
    return a.lineId.substring(0, 1) > b.lineId.substring(0, 1) ? 1 : -1;
  }
  return a.lineId.substring(4, 6) > b.lineId.substring(4, 6) ? 1 : -1;
};

export class FilterPanel extends Component {
  render() {
    const {
      stop,
      route,
      line,
      queryDate,
      queryTime,
      onTimeSelected,
      onDateSelected,
      onStopSelected,
    } = this.props;

    const queryMoment = moment(queryDate);

    return (
      <header className="transitlog-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
        <DateInput date={queryDate} onDateSelected={onDateSelected} />

        {!!route.routeId ? (
          <Query
            key="stop_input_by_route"
            query={stopsByRouteQuery}
            variables={{
              routeId: route.routeId,
              direction: route.direction,
              dateBegin: route.dateBegin,
              dateEnd: route.dateEnd,
            }}>
            {({loading, data, error}) => {
              if (loading) return "Loading...";
              if (error) return "Error!";

              const stops = get(data, "route.routeSegments.nodes", []).map(
                (segment) => segment.stop
              );

              return (
                <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />
              );
            }}
          </Query>
        ) : (
          <Query key="stop_input_all" query={allStopsQuery}>
            {({loading, data, error}) => {
              if (loading) return "Loading...";
              if (error) return "Error!";

              const stops = get(data, "allStops.nodes", []);

              return (
                <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />
              );
            }}
          </Query>
        )}

        <Query query={allLinesQuery}>
          {({loading, error, data}) => {
            if (loading) return <div className="graphqlLoad">Loading...</div>;
            if (error) return <div>Error!</div>;

            return (
              <LineInput
                line={this.props.line}
                onSelect={this.props.onLineSelected}
                lines={data.allLines.nodes
                  .filter((node) => node.routes.totalCount !== 0)
                  .filter(removeFerryFilter)
                  .filter(({dateBegin, dateEnd}) => {
                    const beginMoment = moment(dateBegin);
                    const endMoment = moment(dateEnd);

                    return (
                      beginMoment.isBefore(queryMoment) &&
                      endMoment.isAfter(queryMoment)
                    );
                  })
                  .sort(linesSorter)}
              />
            );
          }}
        </Query>
        <div>
          {line.lineId && (
            <QueryRoutesByLine variables={line}>
              {({loading, error, data}) => {
                if (loading) return <div>Loading...</div>;
                if (error) return <div>Error!</div>;
                return (
                  <RouteInput
                    route={this.props.route}
                    onRouteSelected={this.props.onRouteSelected}
                    routes={data}
                  />
                );
              }}
            </QueryRoutesByLine>
          )}
        </div>
        <div>
          {!!route.routeId && (
            <Query
              query={departuresQuery}
              variables={{
                stopId: route.originstopId,
                routeId: route.routeId,
                direction: route.direction,
                dayType: dayTypes[moment(queryDate).day()],
              }}>
              {({loading, error, data}) => {
                const startTimes = uniq(
                  get(data, "allDepartures.nodes", []).map(
                    (departure) =>
                      `${padNumber(departure.hours, 2)}:${padNumber(
                        departure.minutes,
                        2
                      )}`
                  )
                );

                if (loading) return <div>Loading...</div>;
                if (error) return <div>Error!</div>;

                return (
                  <select
                    value={queryTime}
                    onChange={(e) => onTimeSelected(e.target.value)}>
                    <option value="">Select departure...</option>
                    {startTimes.map((journeyStartTime) => (
                      <option
                        key={`start_time_${journeyStartTime}`}
                        value={journeyStartTime}>
                        {journeyStartTime}
                      </option>
                    ))}
                  </select>
                );
              }}
            </Query>
          )}
        </div>
      </header>
    );
  }
}
