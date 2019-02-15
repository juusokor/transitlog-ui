import gql from "graphql-tag";

export const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    nodeId
    stopId
    lat
    lon
    shortId
    nameFi
    stopRadius
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
    stopRadius
    modes {
      nodes
    }
    routeSegmentsForDate(date: $date) {
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
`;
