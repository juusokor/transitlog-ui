import React from "react";
import gql from "graphql-tag";
import styled from "styled-components";
import {Query} from "react-apollo";
import get from "lodash/get";
import pick from "lodash/pick";
import compact from "lodash/compact";

const EquipmentWrapper = styled.span``;

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

export default ({journey}) => {
  const {unique_vehicle_id} = journey;
  const vehicleId = unique_vehicle_id.split("/")[0];

  return (
    <Query query={vehicleTypeQuery} variables={{vehicleId}}>
      {({data, loading, error}) => {
        if (loading || error) return null;

        const vehicle = get(data, "allEquipment.nodes[0]", null);

        if (!vehicle) {
          return null;
        }

        const multiAxleValue = vehicle.multiAxle ? "teli" : "";
        vehicle.multiAxle = multiAxleValue;

        return (
          <EquipmentWrapper>
            {compact(
              Object.values(
                pick(vehicle, "type", "class", "multiAxle", "exteriorColor")
              )
            ).join(", ")}
          </EquipmentWrapper>
        );
      }}
    </Query>
  );
};
