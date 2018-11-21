import React, {Component} from "react";
import PropTypes from "prop-types";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import reduce from "lodash/reduce";
import doubleDigit from "../helpers/doubleDigit";

const queryPart = (variables) => {
  const {
    routeId = "",
    departureId = 0,
    dateBegin = "",
    dateEnd = "",
    direction = "",
  } = variables;

  // It's important to give each query part an unique alias.
  // Construct such an alias from the routeId and departureId.
  // It also needs a string prefix, ie it can't begin with a number.
  const queryName =
    routeId && departureId && direction
      ? `query_${routeId}_dir${direction}_${departureId}`
      : "allDepartures";

  return `
    ${queryName}: allDepartures(
      first: 1
      orderBy: [HOURS_ASC, MINUTES_ASC, DEPARTURE_ID_ASC]
      condition: {
        routeId: "${routeId}"
        direction: "${direction}"
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
        direction
      }
    }
`;
};

// The container for the query or queries
const firstDepartureQuery = (getQueryParts = queryPart) => gql`
  query allDepartures(
    $dayType: String!
  ) {
    ${getQueryParts()}
  }
`;

// Creates a batched GraphQL query with the requested routeIds and departureIds
const createBatchedFirstDepartureQuery = (routesAndIds) =>
  firstDepartureQuery(() => {
    const parts = routesAndIds.map(queryPart);
    return parts.join("");
  });

@observer
class FirstDepartureQuery extends Component {
  static propTypes = {
    queries: PropTypes.arrayOf(
      PropTypes.shape({
        routeId: PropTypes.string.isRequired,
        departureId: PropTypes.number.isRequired,
        dateBegin: PropTypes.string.isRequired,
        dateEnd: PropTypes.string.isRequired,
        direction: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
      })
    ),
    // Only supports querying by one day at a time
    dayType: PropTypes.string.isRequired,
  };

  render() {
    const {queries = [], dayType, children, skip} = this.props;

    let query;

    if (Array.isArray(queries) && queries.length !== 0) {
      query = createBatchedFirstDepartureQuery(queries);
    } else {
      return children({firstDepartures: null, loading: false, error: null});
    }

    return (
      <Query
        skip={skip}
        query={query}
        variables={{
          dayType,
        }}>
        {({loading, error, data}) => {
          if (loading || error) {
            return children({firstDepartures: null, loading, error});
          }

          const departureStartTimes = reduce(
            data,
            (all, {nodes}) => {
              const departure = get(nodes, "[0]", null);

              if (!departure) {
                return all;
              }

              const collection = all || {};

              const startTime = `${doubleDigit(departure.hours)}:${doubleDigit(
                departure.minutes
              )}:00`;

              const key = `${departure.routeId}_${departure.direction}_${
                departure.departureId
              }`;

              collection[key] = startTime;
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
