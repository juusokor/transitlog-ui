import React, {useRef} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react-lite";

const vehiclesQuery = gql`
  query vehicleOptionsQuery($date: Date, $search: String) {
    equipment(date: $date, filter: {search: $search}) {
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

export default observer(({children, date, skip}) => {
  const prevResults = useRef([]);

  return (
    <Query query={vehiclesQuery} variables={{date}} skip={skip}>
      {({loading, error, data}) => {
        if (loading || !data) {
          return children({
            loading,
            error,
            vehicles: prevResults.current,
          });
        }

        const vehicles = [...get(data, "equipment", [])];
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
