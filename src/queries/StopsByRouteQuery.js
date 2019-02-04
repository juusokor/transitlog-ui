import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
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
      originstopId
      dateBegin
      dateEnd
      routeSegments {
        nodes {
          nodeId
          timingStopType
          dateBegin
          dateEnd
          stopIndex
          distanceFromPrevious
          distanceFromStart
          stop: stopByStopId {
            ...StopFieldsFragment
          }
        }
      }
    }
  }
  ${StopFieldsFragment}
`;

export default observer(({children, route}) => (
  <Query
    query={stopsByRouteQuery}
    variables={{
      routeId: get(route, "routeId", ""),
      direction: get(route, "direction", ""),
      dateBegin: get(route, "dateBegin", ""),
      dateEnd: get(route, "dateEnd", ""),
    }}>
    {({loading, error, data}) => {
      const stops = uniqBy(
        get(data, "route.routeSegments.nodes", []),
        "stop.stopId"
      ).map((segment) => ({
        ...segment.stop,
        timingStopType: segment.timingStopType,
        dateBegin: segment.dateBegin,
        dateEnd: segment.dateEnd,
        stopIndex: segment.stopIndex,
        distanceFromPrevious: segment.distanceFromPrevious,
        distanceFromStart: segment.distanceFromStart,
      }));

      return children({
        loading,
        error,
        stops,
      });
    }}
  </Query>
));
