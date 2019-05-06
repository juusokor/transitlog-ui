import React, {useCallback} from "react";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer, Observer} from "mobx-react-lite";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import flow from "lodash/flow";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import Tooltip from "../Tooltip";
import {inject} from "../../helpers/inject";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";

const decorate = flow(
  observer,
  inject("Filters")
);

const VehicleSettings = decorate(({Filters, state}) => {
  const onSelectVehicle = useCallback((value) => Filters.setVehicle(value), [Filters]);

  const {vehicle = "", date, selectedJourney} = state;
  const isDisabled = !!selectedJourney;
  const fieldLabel = text("filterpanel.filter_by_vehicle");

  return (
    <VehicleOptionsQuery date={date}>
      {({vehicles, search}) => (
        <Observer>
          {() => {
            const selectedVehicle = vehicles.find((v) => v.id === vehicle);

            return (
              <>
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
                  {!!vehicle && (
                    <Tooltip helpText="Clear vehicle">
                      <ClearButton
                        primary={false}
                        small={true}
                        onClick={() => Filters.setVehicle("")}
                      />
                    </Tooltip>
                  )}
                </ControlGroup>
                {selectedVehicle && (
                  <SelectedOptionDisplay withIcon={false}>
                    <SuggestionText withIcon={false}>
                      <strong>{selectedVehicle.id}</strong> {selectedVehicle.registryNr}
                      <br />
                      {selectedVehicle.operatorName}
                    </SuggestionText>
                  </SelectedOptionDisplay>
                )}
              </>
            );
          }}
        </Observer>
      )}
    </VehicleOptionsQuery>
  );
});

export default VehicleSettings;
