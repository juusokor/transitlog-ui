import gql from "graphql-tag";

export const AlertFieldsFragment = gql`
  fragment AlertFieldsFragment on Alert {
    id
    affectedId
    level
    distribution
    impact
    publishedDateTime
    updatedDateTime
    startDateTime
    endDateTime
    title
    description
    url
  }
`;
