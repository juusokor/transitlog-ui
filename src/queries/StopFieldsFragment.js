import gql from "graphql-tag";

const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    nodeId
    stopId
    lat
    lon
    shortId
    nameFi
    __typename
  }
`;

export default StopFieldsFragment;
