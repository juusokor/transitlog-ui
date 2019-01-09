import React from "react";
import styled from "styled-components";
import EquipmentQuery from "../../../queries/EquipmentQuery";
import map from "lodash/map";
import {checkRequirements} from "./equipmentType";

const EquipmentWrapper = styled.span``;

const Requirement = styled.span`
  color: ${({color}) => color};
  font-weight: ${({bold = false}) => (bold ? "bold" : "normal")};

  &:after {
    content: ", ";
  }

  &:last-child:after {
    content: " ";
  }
`;

export default ({journey, departure}) => {
  const {owner_operator_id, vehicle_number} = journey;

  const operatorId = (owner_operator_id + "").padStart(4, "0");
  const vehicleId = vehicle_number.toString();

  return (
    <EquipmentQuery vehicleId={vehicleId} operatorId={operatorId}>
      {({vehicle, loading}) => {
        if (!vehicle || loading) return null;

        const equipmentRequirements = checkRequirements(departure, vehicle);

        return (
          <EquipmentWrapper>
            {map(equipmentRequirements, ({observed, required}, prop) => {
              const isRequired = required !== false;

              const color = isRequired
                ? observed === required
                  ? "var(--light-green)"
                  : "var(--red)"
                : "var(--dark-grey)";

              return (
                <Requirement
                  key={`observed_equipment_${prop}`}
                  color={color}
                  bold={isRequired}>
                  {observed}
                </Requirement>
              );
            })}
          </EquipmentWrapper>
        );
      }}
    </EquipmentQuery>
  );
};
