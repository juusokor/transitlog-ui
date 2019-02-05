import React, {Component} from "react";
import PropTypes from "prop-types";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {isWithinRange, intval} from "../helpers/isWithinRange";
import gql from "graphql-tag";
import get from "lodash/get";
import reduce from "lodash/reduce";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import {getDayTypeFromDate} from "../helpers/getDayTypeFromDate";

const departuresQuery = gql`
  query allDepartures(
    $routeId: String
    $direction: String
    $dayType: String
    $stopId: String!
    $dateBegin: Date
    $dateEnd: Date
    $departureId: Int
    $limit: Int
  ) {
    allDepartures(
      first: $limit
      orderBy: [HOURS_ASC, MINUTES_ASC, DEPARTURE_ID_ASC]
      condition: {
        routeId: $routeId
        direction: $direction
        stopId: $stopId
        dateBegin: $dateBegin
        dateEnd: $dateEnd
        departureId: $departureId
        dayType: $dayType
      }
    ) {
      nodes {
        stopId
        dayType
        hours
        minutes
        arrivalHours
        arrivalMinutes
        terminalTime
        recoveryTime
        equipmentRequired
        equipmentType
        trunkColorRequired
        operatorId
        dateBegin
        dateEnd
        routeId
        direction
        departureId
        extraDeparture
        isNextDay
        originDeparture {
          stopId
          dayType
          hours
          minutes
          routeId
          direction
          departureId
          arrivalHours
          arrivalMinutes
          isNextDay
        }
      }
    }
  }
`;

@observer
class DeparturesQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string,
      direction: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      originstopId: PropTypes.string,
    }),
    date: PropTypes.string.isRequired,
    stop: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        stopId: PropTypes.string,
      }),
    ]),
    departureId: PropTypes.number,
    dateBegin: PropTypes.string,
    dateEnd: PropTypes.string,
    limit: PropTypes.number,
    skip: PropTypes.bool,
  };

  static defaultProps = {
    route: {
      routeId: "",
      direction: "",
    },
    stop: {
      stopId: "",
    },
  };

  render() {
    const {
      route,
      stop,
      date,
      dateBegin,
      dateEnd,
      departureId,
      limit,
      children,
      skip = false,
    } = this.props;

    const queryDayType = getDayTypeFromDate(date);

    const {routeId = "", direction = "", originstopId = ""} = route;
    const stopId = originstopId ? originstopId : get(stop, "stopId", stop);

    let queryVars = reduce(
      {
        dayType: queryDayType,
        stopId,
        routeId,
        direction: "" + direction, // make sure it is a string
        departureId,
        dateBegin,
        dateEnd,
        limit,
      },
      (presentVars, value, key) => {
        if (value) {
          presentVars[key] = value;
        }

        return presentVars;
      },
      {}
    );

    if (!stopId || !queryDayType || Object.keys(queryVars).length < 2) {
      // If we don't have the required info, return an empty array to the render function.
      return children({departures: [], loading: false, error: null});
    }

    return (
      <Query query={departuresQuery} variables={queryVars} skip={skip}>
        {({loading, error, data}) => {
          if (loading || error) {
            return children({departures: [], loading, error});
          }

          let departures = get(data, "allDepartures.nodes", []);

          // If the query was not constrained by dateBegin or dateEnd, do that here.
          if (!dateBegin || !dateEnd) {
            departures = departures.filter((departure) => {
              return isWithinRange(date, departure.dateBegin, departure.dateEnd);
            });
          }

          // The departures may contain items that are identical and have overlapping
          // in-effect ranges resulting in doubles showing up in the UI lists.
          // They are filtered out here.
          const groupedDepartures = groupBy(
            departures,
            (departure) =>
              departure.routeId +
              departure.direction +
              departure.hours +
              departure.minutes +
              departure.stopId +
              departure.dayType +
              departure.extraDeparture
          );

          // Pick the most recent departure item from each group.
          departures = reduce(
            groupedDepartures,
            (filteredDepartures, departures) => {
              filteredDepartures.push(
                // Pick the most recent departure item by sorting it first in the list.
                orderBy(departures, ({dateBegin}) => intval(dateBegin), "desc")[0]
              );
              return filteredDepartures;
            },
            []
          );

          return children({departures, loading: false, error: null});
        }}
      </Query>
    );
  }
}

export default DeparturesQuery;
