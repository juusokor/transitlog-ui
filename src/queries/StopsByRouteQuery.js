import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import {observer} from "mobx-react";
import {StopFieldsFragment} from "./StopFieldsFragment";
import {filterRouteSegments} from "../helpers/filterJoreCollections";

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
          routeId
          direction
          stopId
          nextStopId
          stopIndex
          stop: stopByStopId {
            ...StopFieldsFragment
          }
        }
      }
    }
  }
  ${StopFieldsFragment}
`;

export default observer(({children, route, skip}) => (
  <Query
    skip={skip}
    query={stopsByRouteQuery}
    variables={{
      routeId: get(route, "routeId", ""),
      direction: get(route, "direction", ""),
      dateBegin: get(route, "dateBegin", ""),
      dateEnd: get(route, "dateEnd", ""),
    }}>
    {({loading, error, data}) => {
      const stops = sortBy(
        filterRouteSegments(get(data, "route.routeSegments.nodes", [])).map(
          (segment) => ({
            ...segment.stop,
            timingStopType: segment.timingStopType,
            dateBegin: segment.dateBegin,
            dateEnd: segment.dateEnd,
            stopIndex: segment.stopIndex,
            distanceFromPrevious: segment.distanceFromPrevious,
            distanceFromStart: segment.distanceFromStart,
          })
        ),
        "stopIndex"
      );

      return children({
        loading,
        error,
        stops,
      });
    }}
  </Query>
));
