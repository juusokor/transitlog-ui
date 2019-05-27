import React, {useRef} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

export const allStopsQuery = gql`
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
      alerts {
        ...AlertFieldsFragment
      }
    }
  }
  ${AlertFieldsFragment}
`;

export default ({children}) => {
  const prevResults = useRef([]);

  return (
    <Query query={allStopsQuery}>
      {({loading, error, data}) => {
        if (loading || !data) {
          return children({
            loading,
            error,
            stops: prevResults.current,
          });
        }

        const stops = get(data, "stops", []);
        prevResults.current = stops;

        return children({
          loading,
          error,
          stops,
        });
      }}
    </Query>
  );
};
