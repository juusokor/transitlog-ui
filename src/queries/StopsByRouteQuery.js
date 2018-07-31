import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";

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

export default ({children, variables}) => (
  <Query query={stopsByRouteQuery} variables={variables}>
    {({loading, error, data}) => {
      if (loading) return "Loading...";
      if (error) return "Error!";

      const stops = get(data, "route.routeSegments.nodes", []).map((segment) => ({
        stopIndex: segment.stopIndex,
        ...segment.stop,
      }));

      return children({
        loading,
        error,
        stops,
      });
    }}
  </Query>
);
