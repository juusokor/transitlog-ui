import gql from "graphql-tag";

export const AlertFieldsFragment = gql`
  fragment AlertFieldsFragment on Alert {
    affectedId
    level
    distribution
    category
    impact
    lastModifiedDateTime
    startDateTime
    endDateTime
    title
    description
    url
  }
`;
