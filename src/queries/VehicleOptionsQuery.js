import React, {useRef} from "react";
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
      operatorId
      registryNr
      vehicleId
    }
  }
`;

const client = getServerClient();

export default observer(({children, date, search = "", skip}) => {
  const prevResults = useRef([]);

  return (
    <Query
      fetchPolicy="network-only"
      query={vehiclesQuery}
      variables={{date, search: search || ""}}
      skip={skip}
      client={client}>
      {({loading, error, data}) => {
        if (loading || !data) {
          return children({loading, error, vehicles: prevResults.current});
        }

        const vehicles = get(data, "equipment", []);
        prevResults.current = vehicles;

        return children({
          loading: loading,
          error,
          vehicles,
        });
      }}
    </Query>
  );
});
