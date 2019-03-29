import gql from "graphql-tag";

export const RouteFieldsFragment = gql`
  fragment RouteFieldsFragment on Route {
    id
    lineId
    routeId
    direction
    destination
    destinationStopId
    mode
    name
    origin
    originStopId
  }
`;
