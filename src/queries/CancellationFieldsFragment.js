import gql from "graphql-tag";

export const CancellationFieldsFragment = gql`
  fragment CancellationFieldsFragment on Cancellation {
    routeId
    direction
    departureDate
    journeyStartTime
    title
    description
    category
    subCategory
    isCancelled
    cancellationType
    cancellationEffect
    lastModifiedDateTime
  }
`;
