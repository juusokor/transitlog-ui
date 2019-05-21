import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import {CancellationFieldsFragment} from "./CancellationFieldsFragment";

const cancellationsQuery = gql`
  query alertsQuery(
    $time: String!
    $all: Boolean
    $routeId: String
    $direction: Int
    $departureTime: String
  ) {
    cancellations(
      time: $time
      cancellationSearch: {
        all: $all
        routeId: $routeId
        direction: $direction
        departureTime: $departureTime
      }
    ) {
      ...CancellationFieldsFragment
    }
  }
  ${CancellationFieldsFragment}
`;

const CancellationsQuery = observer(({time, cancellationsSearch, children}) => {
  return (
    <Query query={cancellationsQuery} variables={{time, ...cancellationsSearch}}>
      {({loading, error, data}) => {
        const cancellations = get(data, "cancellations", []);

        return children({
          loading,
          error,
          cancellations,
        });
      }}
    </Query>
  );
});

export default CancellationsQuery;
