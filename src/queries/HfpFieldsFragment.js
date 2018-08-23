import gql from "graphql-tag";

const HfpFieldsFragment = gql`
  fragment HfpFieldsFragment on Vehicle {
    journeyStartTime
    nextStopId
    receivedAt
    lat
    long
    uniqueVehicleId
    drst
    spd
    mode
    dl
    jrn
    oday
    directionId
    routeId
    __typename
  }
`;

export default HfpFieldsFragment;
