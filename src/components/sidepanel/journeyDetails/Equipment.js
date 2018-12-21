import React from "react";
import styled from "styled-components";
import pick from "lodash/pick";
import compact from "lodash/compact";
import EquipmentQuery from "../../../queries/EquipmentQuery";

const EquipmentWrapper = styled.span``;

export default ({journey}) => {
  const {unique_vehicle_id} = journey;
  const vehicleId = parseInt(unique_vehicle_id.split("/")[0], 10) + "";

  return (
    <EquipmentQuery vehicleId={vehicleId}>
      {({vehicle, loading}) => {
        if (!vehicle || loading) return null;

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
    </EquipmentQuery>
  );
};
