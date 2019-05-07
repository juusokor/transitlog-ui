import gql from "graphql-tag";

export const RouteFieldsFragment = gql`
  fragment RouteFieldsFragment on Route {
    id
    routeId
    direction
    destination
    destinationStopId
    mode
    name
    origin
    originStopId
    alerts {
      affectedId
      alertLevel
      description
      distribution
      id
      startDateTime
      endDateTime
      title
      url
    }
  }
`;
