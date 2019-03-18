import React, {useRef, useCallback} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {getServerClient} from "../api";

const vehiclesQuery = gql`
  query vehicleOptionsQuery($date: Date, $search: String) {
    equipment(date: $date, filter: {search: $search}) {
      _matchScore
      age
      id
      inService
      vehicleId
      operatorId
      operatorName
      registryNr
      exteriorColor
      emissionClass
      emissionDesc
      type
    }
  }
`;

const client = getServerClient();

export default observer(({children, date, skip}) => {
  const prevResults = useRef([]);

  const createSearchFetcher = useCallback(
    (refetch) => (searchTerm) => refetch({search: searchTerm, date}),
    [date]
  );

  return (
    <Query query={vehiclesQuery} variables={{date}} skip={skip} client={client}>
      {({loading, error, data, refetch}) => {
        if (loading || !data) {
          return children({
            loading,
            error,
            search: createSearchFetcher(refetch),
            vehicles: prevResults.current,
          });
        }

        const vehicles = [...get(data, "equipment", [])];
        prevResults.current = vehicles;

        return children({
          loading: loading,
          error,
          search: createSearchFetcher(refetch),
          vehicles,
        });
      }}
    </Query>
  );
});
