import React, {Component} from "react";
import PropTypes from "prop-types";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import parse from "date-fns/parse";
import isWithinRange from "date-fns/is_within_range";
import gql from "graphql-tag";
import getDay from "date-fns/get_day";
import get from "lodash/get";
import compact from "lodash/compact";
import reduce from "lodash/reduce";
import pick from "lodash/pick";

const departuresQuery = gql`
  query allDepartures(
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
      routeId: PropTypes.string,
      direction: PropTypes.string,
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
  };

  static defaultProps = {
    route: {
      routeId: null,
      direction: null,
    },
    stop: {
      stopId: null,
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
    } = this.props;

    const queryDayType = dayTypes[getDay(date)];

    const {routeId, direction, originstopId} = route;
    const stopId = get(stop, "stopId", stop);

    let queryVars = reduce(
      {
        dayType: queryDayType,
        stopId: originstopId ? originstopId : stopId,
        routeId,
        direction,
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

    if (Object.keys(queryVars).length < 2) {
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
