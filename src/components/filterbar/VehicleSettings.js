import React, {useCallback} from "react";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import {observer} from "mobx-react-lite";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import flow from "lodash/flow";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import Tooltip from "../Tooltip";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("Filters")
);

const VehicleSettings = decorate(({Filters, state}) => {
  const onSelectVehicle = useCallback((value) => Filters.setVehicle(value), [Filters]);

  const {vehicle = "", date, selectedJourney} = state;
  const isDisabled = !!selectedJourney;
  const fieldLabel = text("filterpanel.filter_by_vehicle");

  if (isDisabled) {
    return (
      <ControlGroup>
        <Input
          helpText="Select vehicle disabled"
          label={fieldLabel}
          animatedLabel={false}
          value={vehicle}
          disabled={true}
        />
      </ControlGroup>
    );
  }

  return (
    <>
      <VehicleOptionsQuery date={date}>
        {({vehicles, search}) => (
          <ControlGroup>
            <Input
              helpText="Select vehicle"
              label={fieldLabel}
              animatedLabel={false}
              value={vehicle}
              disabled={isDisabled}>
              <VehicleInput
                search={search}
                options={vehicles}
                value={vehicle}
                onSelect={onSelectVehicle}
              />
            </Input>
          </ControlGroup>
        )}
      </VehicleOptionsQuery>
      {!!vehicle && (
        <Tooltip helpText="Clear vehicle">
          <Button primary={false} small={true} onClick={() => Filters.setVehicle("")}>
            <Text>filterpanel.clear.vehicle</Text>
          </Button>
        </Tooltip>
      )}
    </>
  );
});

export default VehicleSettings;
