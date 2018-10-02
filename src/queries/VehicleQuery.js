import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {hfpClient} from "../api";
import HfpFieldsFragment from "./HfpFieldsFragment";

const vehiclesQuery = gql`
  query vehiclesQuery($vehicleId: String, $date: Date) {
    allVehicles(
      orderBy: RECEIVED_AT_ASC
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
  <Query client={hfpClient} query={vehiclesQuery} variables={{vehicleId, date}}>
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
