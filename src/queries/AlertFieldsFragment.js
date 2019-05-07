import gql from "graphql-tag";

export const AlertFieldsFragment = gql`
  fragment AlertFieldsFragment on Alert {
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
`;
