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
import uniqBy from "lodash/uniqBy";
import {hfpClient} from "../api";
import moment from "moment";

const allStopsQuery = gql`
  {
    allStops {
      nodes {
        stopId
        shortId
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

const journeyStartTimeQuery = gql`
  query startTimesQuery($routeId: String!, $direction: Int!, $date: Date!) {
    allVehicles(
      condition: {routeId: $routeId, directionId: $direction, oday: $date}
    ) {
      nodes {
        journeyStartTime
      }
    }
  }
`;

const removeFerryFilter = (line) => line.lineId.substring(0, 4) !== "1019";

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

        <Query query={allStopsQuery}>
          {({loading, data, error}) => {
            if (loading) return "Loading...";
            if (error) return "Error!";

            const stops = get(data, "allStops.nodes", []);
            return <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />;
          }}
        </Query>

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
          {!!queryDate &&
            !!route.routeId && (
              <Query
                client={hfpClient}
                query={journeyStartTimeQuery}
                variables={{
                  date: queryDate,
                  routeId: route.routeId,
                  direction: route.direction,
                }}>
                {({loading, error, data}) => {
                  const startTimes = uniqBy(
                    get(data, "allVehicles.nodes", []),
                    "journeyStartTime"
                  );

                  if (loading) return <div>Loading...</div>;
                  if (error) return <div>Error!</div>;

                  return (
                    <select
                      value={queryTime}
                      onChange={(e) => onTimeSelected(e.target.value)}>
                      <option value="">Select departure...</option>
                      {startTimes.map(({journeyStartTime}) => (
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
