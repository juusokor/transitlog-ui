import gql from "graphql-tag";
import RouteFieldsFragment from "./RouteFieldsFragment";

const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    nodeId
    stopId
    lat
    lon
    shortId
    nameFi
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

export default StopFieldsFragment;
