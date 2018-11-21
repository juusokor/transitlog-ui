import React, {Component} from "react";
import PropTypes from "prop-types";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import reduce from "lodash/reduce";
import doubleDigit from "../helpers/doubleDigit";

const queryPart = (routeId = "", departureId = "", dateBegin = "", dateEnd = "") => {
  const queryName =
    routeId && departureId ? `query_${routeId}_${departureId}` : "allDepartures";

  return `
    ${queryName}: allDepartures(
      first: 1
      orderBy: [HOURS_ASC, MINUTES_ASC, DEPARTURE_ID_ASC]
      condition: {
        routeId: "${routeId}"
        direction: $direction
        dateBegin: "${dateBegin}"
        dateEnd: "${dateEnd}"
        departureId: ${departureId}
        dayType: $dayType
      }
    ) {
      nodes {
        hours
        minutes
        departureId
        routeId
      }
    }
`;
};

const firstDepartureQuery = (getQueryParts = queryPart) => gql`
  query allDepartures(
    $direction: String!
    $dayType: String!
  ) {
    ${getQueryParts()}
  }
`;

const createBatchedFirstDepartureQuery = (routesAndIds) =>
  firstDepartureQuery(() => {
    const parts = routesAndIds.map(({routeId, departureId, dateBegin, dateEnd}) =>
      queryPart(routeId, departureId, dateBegin, dateEnd)
    );

    return parts.join("");
  });

@observer
class FirstDepartureQuery extends Component {
  static propTypes = {
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        routeId: PropTypes.string.isRequired,
        departureId: PropTypes.number.isRequired,
        dateBegin: PropTypes.string.isRequired,
        dateEnd: PropTypes.string.isRequired,
      })
    ),
    direction: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dayType: PropTypes.string.isRequired,
  };

  render() {
    const {routes = [], direction = 0, dayType, children, skip} = this.props;

    let query = firstDepartureQuery();

    if (Array.isArray(routes) && routes.length !== 0) {
      query = createBatchedFirstDepartureQuery(routes);
    }

    return (
      <Query
        skip={skip}
        query={query}
        variables={{
          direction,
          dayType,
        }}>
        {({loading, error, data}) => {
          if (loading || error) {
            return children({firstDepartures: null, loading, error});
          }

          const departureStartTimes = reduce(
            data,
            (all, {nodes}, key) => {
              const departure = get(nodes, "[0]", null);

              if (!departure) {
                return all;
              }

              const collection = all || {};

              const startTime = `${doubleDigit(departure.hours)}:${doubleDigit(
                departure.minutes
              )}:00`;

              collection[key.replace("query_", "")] = startTime;
              return collection;
            },
            null
          );

          if (!departureStartTimes) {
            return children({firstDepartures: null, loading: false, error: null});
          }

          return children({
            firstDepartures: departureStartTimes,
            loading: false,
            error: null,
          });
        }}
      </Query>
    );
  }
}

export default FirstDepartureQuery;
