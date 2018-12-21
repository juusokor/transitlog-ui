import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import React from "react";

const vehicleTypeQuery = gql`
  query vehicleInfo($vehicleId: String) {
    allEquipment(condition: {vehicleId: $vehicleId}) {
      nodes {
        vehicleId
        registryNr
        age
        type
        multiAxle
        exteriorColor
        class
      }
    }
  }
`;

export default ({vehicleId, skip = false, children}) => {
  return (
    <Query query={vehicleTypeQuery} variables={{vehicleId}} skip={skip}>
      {({data, loading, error}) => {
        if (error) {
          console.error(error);
        }

        if (loading || error) children({vehicle: null, loading});

        const vehicle = get(data, "allEquipment.nodes[0]", null);

        if (!vehicle) {
          return children({vehicle: null, loading});
        }

        // TODO: Translate "teli"
        const multiAxleValue = vehicle.multiAxle ? "teli" : "";
        vehicle.multiAxle = multiAxleValue;

        return children({vehicle, loading});
      }}
    </Query>
  );
};
