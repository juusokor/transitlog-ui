import React, {Component} from "react";
import PropTypes from "prop-types";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import parse from "date-fns/parse";
import isWithinRange from "date-fns/is_within_range";
import gql from "graphql-tag";
import getDay from "date-fns/get_day";
import get from "lodash/get";

const departuresQuery = gql`
  query routeDepartures(
    $routeId: String
    $direction: String
    $dayType: String
    $stopId: String
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
        dateBegin
        dateEnd
        routeId
        direction
        departureId
      }
    }
  }
`;

const dayTypes = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

@observer
class DeparturesQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string.isRequired,
      direction: PropTypes.string.isRequired,
      originstopId: PropTypes.string.isRequired,
    }),
    date: PropTypes.string.isRequired,
    stop: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        stopId: PropTypes.string.isRequired,
      }),
    ]),
    departureId: PropTypes.number,
    dateBegin: PropTypes.string,
    dateEnd: PropTypes.string,
  };

  render() {
    const {
      routeId: propRouteId = "",
      direction: propDirection = "",
      route = {routeId: propRouteId, direction: propDirection},
      stop = {stopId: ""},
      date,
      dateBegin,
      dateEnd,
      departureId,
      children,
    } = this.props;
    const queryDayType = dayTypes[getDay(date)];

    const {routeId = "", direction = "", originstopId = ""} = route;
    const stopId = get(stop, "stopId", stop);

    let queryVars = {};

    if (!routeId && stopId && typeof stopId === "string") {
      // If we don't have a route, but we do have a stop, query for the stop departures.
      queryVars = {
        stopId,
        dayType: queryDayType,
      };
    } else if (!departureId && routeId && direction && originstopId) {
      // If we have a route with all required ingredients, query for the planned route journeys.
      queryVars = {
        routeId,
        direction,
        dayType: queryDayType,
        stopId: originstopId,
      };
    } else if (departureId && dateBegin && dateEnd && routeId && direction) {
      // In this case we want the start time of a journey when we have a departure from a stop.
      queryVars = {
        routeId,
        direction,
        departureId,
        dateBegin,
        dateEnd,
        dayType: queryDayType,
        limit: 1,
      };
    } else {
      // If we don't have the required info, return an empty array to the render function.
      return children({departures: [], loading: false, error: null});
    }

    return (
      <Query query={departuresQuery} variables={queryVars}>
        {({loading, error, data}) => {
          if (loading || error) {
            return children({departures: [], loading, error});
          }

          let departures = get(data, "allDepartures.nodes", []);

          // If the query was not constrained by dateBegin or dateEnd, do that here.
          if (!dateBegin || !dateEnd) {
            departures = departures.filter(({dateBegin, dateEnd}) => {
              const begin = parse(dateBegin);
              const end = parse(dateEnd);

              return isWithinRange(date, begin, end);
            });
          }

          return children({departures, loading: false, error: null});
        }}
      </Query>
    );
  }
}

export default DeparturesQuery;
