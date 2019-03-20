import gql from "graphql-tag";

export const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    id
    stopId
    shortId
    lat
    lng
    name
    radius
    modes
    routes {
      direction
      isTimingStop
      originStopId
      routeId
      lineId
    }
  }
`;
