import React from "react";
import gql from "graphql-tag";
import styled from "styled-components";
import {Query} from "react-apollo";
import get from "lodash/get";
import pick from "lodash/pick";

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
        if (loading || error) return "...";

        const vehicle = get(data, "allEquipment.nodes[0]", {});

        return (
          <EquipmentWrapper>
            {Object.values(
              pick(vehicle, "type", "multiAxle", "exteriorColor", "class")
            ).join(", ")}
          </EquipmentWrapper>
        );
      }}
    </Query>
  );
};
