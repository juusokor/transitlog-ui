import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import HfpFieldsFragment from "./HfpFieldsFragment";

const vehiclesQuery = gql`
  query vehiclesQuery($vehicleId: String, $date: Date) {
    allVehicles(
      order_by: {received_at: asc}
      condition: {unique_vehicle_id: $vehicleId, oday: $date, geohashLevel: 0}
    ) {
      nodes {
        ...HfpFieldsFragment
      }
    }
  }
  ${HfpFieldsFragment}
`;

export default ({children, vehicleId, date}) => (
  <Query query={vehiclesQuery} variables={{vehicleId, date}}>
    {({loading, error, data}) => {
      if (loading) return "Loading...";
      if (error) return "Error!";

      const vehicles = get(data, "allVehicles.nodes", []);

      return children({
        loading,
        error,
        vehicles,
      });
    }}
  </Query>
);
