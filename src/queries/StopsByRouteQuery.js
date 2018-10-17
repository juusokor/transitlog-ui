import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import withRoute from "../hoc/withRoute";
import {observer} from "mobx-react";
import {StopFieldsFragment} from "./StopFieldsFragment";

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
      nodeId
      __typename
      routeSegments {
        nodes {
          nodeId
          stopIndex
          __typename
          stop: stopByStopId {
            ...StopFieldsFragment
          }
        }
      }
    }
  }
  ${StopFieldsFragment}
`;

export default withRoute(
  observer(({children, route}) => (
    <Query
      query={stopsByRouteQuery}
      variables={{
        routeId: get(route, "routeId", ""),
        direction: get(route, "direction", ""),
        dateBegin: get(route, "dateBegin", ""),
        dateEnd: get(route, "dateEnd", ""),
      }}>
      {({loading, error, data}) => {
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
  ))
);
