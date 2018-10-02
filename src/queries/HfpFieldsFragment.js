import gql from "graphql-tag";

const HfpFieldsFragment = gql`
  fragment HfpFieldsFragment on vehicles {
    journey_start_time
    next_stop_id
    received_at
    lat
    long
    unique_vehicle_id
    drst
    spd
    mode
    dl
    jrn
    oday
    direction_id
    route_id
    __typename
  }
`;

export default HfpFieldsFragment;
