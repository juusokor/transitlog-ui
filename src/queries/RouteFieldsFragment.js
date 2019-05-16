import gql from "graphql-tag";
import {AlertFieldsFragment} from "./AlertFieldsFragment";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";

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
    cancellations {
      ...CancellationFieldsFragment
    }
  }
  ${AlertFieldsFragment}
  ${CancellationFieldsFragment}
`;
