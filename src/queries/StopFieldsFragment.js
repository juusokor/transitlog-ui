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
