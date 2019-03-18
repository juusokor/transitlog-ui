import React, {useCallback, useRef} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {getServerClient} from "../api";

const allStopsQuery = gql`
  query allStopsQuery($search: String) {
    stops(filter: {search: $search}) {
      id
      stopId
      shortId
      lat
      lng
      name
      radius
      modes
      _matchScore
    }
  }
`;

const client = getServerClient();

export default ({children}) => {
  const prevResults = useRef([]);

  const createSearchFetcher = useCallback(
    (refetch) => (searchTerm) => refetch({search: searchTerm}),
    []
  );

  return (
    <Query query={allStopsQuery} client={client}>
      {({loading, error, data, refetch}) => {
        const search = createSearchFetcher(refetch);

        if (loading || !data) {
          return children({
            loading,
            error,
            stops: prevResults.current,
            search,
          });
        }

        const stops = get(data, "stops", []);
        prevResults.current = stops;

        return children({
          loading,
          error,
          stops,
          search,
        });
      }}
    </Query>
  );
};
