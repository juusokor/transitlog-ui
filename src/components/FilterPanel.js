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
import orderBy from "lodash/orderBy";
import moment from "moment";
import TimeSlider from "./TimeSlider";

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
          stopIndex
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

const removeFerryFilter = (line) => line.lineId.substring(0, 4) !== "1019";

export class FilterPanel extends Component {
  state = {
    timeIncrement: 5,
  };

  onDateButtonClick = (modifier) => (e) => {
    const {queryDate, onDateSelected} = this.props;

    const nextDate = moment(queryDate, "YYYY-MM-DD")
      .add(modifier, "days")
      .format("YYYY-MM-DD");

    onDateSelected(nextDate);
  };

  onTimeButtonClick = (modifier) => (e) => {
    const {queryTime, onChangeQueryTime} = this.props;

    const nextDate = moment(queryTime, "HH:mm:ss")
      .add(modifier, "seconds")
      .format("HH:mm:ss");

    onChangeQueryTime(nextDate);
  };

  setTimeIncrement = ({target}) => {
    this.setState({
      timeIncrement: target.value,
    });
  };

  render() {
    const {
      stop,
      route,
      line,
      queryDate,
      queryTime,
      isPlaying,
      onChangeQueryTime,
      onDateSelected,
      onStopSelected,
      onRouteSelected,
      onClickPlay,
    } = this.props;

    const {timeIncrement} = this.state;

    const queryMoment = moment(queryDate);

    return (
      <header className="transitlog-header filter-panel">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
        <div className="date-input">
          <button onClick={this.onDateButtonClick(-7)}>&laquo; 1 viikko</button>
          <button onClick={this.onDateButtonClick(-1)}>&lsaquo; 1 päivä</button>
          <DateInput date={queryDate} onDateSelected={onDateSelected} />
          <button onClick={this.onDateButtonClick(1)}>1 päivä &rsaquo;</button>
          <button onClick={this.onDateButtonClick(7)}>1 viikko &raquo;</button>
        </div>
        <div>
          <p>
            <TimeSlider value={queryTime} onChange={onChangeQueryTime} />
          </p>
          <p>
            <button onClick={this.onTimeButtonClick(-timeIncrement)}>
              &lsaquo; {timeIncrement} sek.
            </button>
            <input
              value={queryTime}
              onChange={(e) => onChangeQueryTime(e.target.value)}
            />
            <button onClick={this.onTimeButtonClick(timeIncrement)}>
              &rsaquo; {timeIncrement} sek.
            </button>
          </p>
          <p>
            <label>
              Time increment:{" "}
              <input value={timeIncrement} onChange={this.setTimeIncrement} />
            </label>
          </p>
        </div>
        <p>
          <button onClick={onClickPlay}>
            {isPlaying ? "Pysäytä simulaatio" : "Simuloi"}
          </button>
        </p>
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
                (segment) => ({stopIndex: segment.stopIndex, ...segment.stop})
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
                lines={orderBy(
                  get(data, "allLines.nodes", [])
                    .filter((node) => node.routes.totalCount !== 0)
                    .filter(removeFerryFilter)
                    .filter(({dateBegin, dateEnd}) => {
                      const beginMoment = moment(dateBegin);
                      const endMoment = moment(dateEnd);

                      return (
                        beginMoment.isBefore(queryMoment) &&
                        endMoment.isAfter(queryMoment)
                      );
                    }),
                  "lineId"
                )}
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
                    route={route}
                    onRouteSelected={onRouteSelected}
                    routes={data}
                  />
                );
              }}
            </QueryRoutesByLine>
          )}
        </div>
      </header>
    );
  }
}
