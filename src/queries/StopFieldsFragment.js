import gql from "graphql-tag";
import RouteFieldsFragment from "./RouteFieldsFragment";

export const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    nodeId
    stopId
    lat
    lon
    shortId
    nameFi
    modes {
      nodes
    }
  }
`;

export const StopFieldsWithRouteSegmentsFragment = gql`
  fragment StopFieldsWithRouteSegmentsFragment on Stop {
    nodeId
    stopId
    lat
    lon
    shortId
    nameFi
    modes {
      nodes
    }
    timingStopTypes: routeSegmentsForDate(date: $date) {
      nodes {
        timingStopType
        direction
        routeId
      }
    }
    routeSegmentsForDate(date: $date) @include(if: $fetchRouteSegments) {
      nodes {
        line {
          nodes {
            lineId
            dateBegin
            dateEnd
          }
        }
        dateBegin
        dateEnd
        routeId
        direction
        timingStopType
        route {
          nodes {
            ...RouteFieldsFragment
          }
        }
      }
    }
  }
  ${RouteFieldsFragment}
`;
