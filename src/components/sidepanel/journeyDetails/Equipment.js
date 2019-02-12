import React from "react";
import EquipmentQuery from "../../../queries/EquipmentQuery";
import map from "lodash/map";
import {checkRequirements} from "./equipmentType";

export default ({journey, departure, children}) => {
  if (!journey || !departure) {
    return children({equipment: [], loading: false});
  }

  const {owner_operator_id = 0, vehicle_number = 0} = journey;

  const operatorId = (owner_operator_id + "").padStart(4, "0");
  const vehicleId = vehicle_number + "";

  return (
    <EquipmentQuery vehicleId={vehicleId} operatorId={operatorId}>
      {({vehicle, loading}) => {
        if (!vehicle || loading) {
          return children({equipment: [], loading});
        }

        const equipmentRequirements = checkRequirements(departure, vehicle);

        const equipment = map(
          equipmentRequirements,
          ({observed, required}, prop) => {
            const isRequired = required !== false;

            const color = isRequired
              ? observed === required
                ? "var(--light-green)"
                : "var(--red)"
              : "var(--lighter-grey)";

            return {
              name: prop,
              observed,
              required,
              color,
            };
          }
        );

        return children({equipment, vehicle, loading});
      }}
    </EquipmentQuery>
  );
};
