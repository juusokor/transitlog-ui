import gql from "graphql-tag";

const RouteFieldsFragment = gql`
  fragment RouteFieldsFragment on Route {
    nodeId
    routeId
    direction
    dateBegin
    dateEnd
    destinationFi
    originFi
    nameFi
    originstopId
    __typename
  }
`;

export default RouteFieldsFragment;
