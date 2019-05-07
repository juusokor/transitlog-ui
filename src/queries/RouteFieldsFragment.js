import gql from "graphql-tag";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

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
      ...AlertFieldsFragment
    }
  }
  ${AlertFieldsFragment}
`;
