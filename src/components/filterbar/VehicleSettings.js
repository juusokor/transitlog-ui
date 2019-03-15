import React from "react";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import sortBy from "lodash/sortBy";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import {getOperatorName} from "../../helpers/getOperatorNameById";
import Tooltip from "../Tooltip";
import {observable, action} from "mobx";

@inject(app("Filters"))
@observer
class VehicleSettings extends React.Component {
  @observable
  vehicleSearch = "";

  onInputChange = action((value) => {
    this.vehicleSearch = value;
  });

  onSelectVehicle = (value) => {
    this.props.Filters.setVehicle(value);
  };

  renderInput(children, value, isDisabled = false) {
    return (
      <ControlGroup>
        <Input
          helpText="Select vehicle disabled"
          label={text("filterpanel.filter_by_vehicle")}
          animatedLabel={false}
          value={value}
          disabled={isDisabled}>
          {children}
        </Input>
      </ControlGroup>
    );
  }

  render() {
    const {state} = this.props;
    const {vehicle = "", date, selectedJourney} = state;

    const isDisabled = !!selectedJourney;

    if (isDisabled) {
      return this.renderInput(undefined, vehicle, true);
    }

    return (
      <>
        <VehicleOptionsQuery date={date} search={this.vehicleSearch}>
          {({vehicles}) => {
            const groupedVehicles = sortBy(
              map(
                groupBy(vehicles, ({operatorId}) => parseInt(operatorId, 10) + ""),
                (vehicles, operatorId) => {
                  return {
                    operatorName: getOperatorName(operatorId),
                    operatorId: operatorId,
                    vehicles: sortBy(vehicles, "vehicleId"),
                  };
                }
              ),
              "operatorId"
            );

            return this.renderInput(
              <VehicleInput
                onInputChange={this.onInputChange}
                options={groupedVehicles}
                value={vehicle}
                onSelect={this.onSelectVehicle}
              />,
              vehicle
            );
          }}
        </VehicleOptionsQuery>
        {!!vehicle && (
          <Tooltip helpText="Clear vehicle">
            <Button
              primary={false}
              small={true}
              onClick={() => this.onSelectVehicle("")}>
              <Text>filterpanel.clear.vehicle</Text>
            </Button>
          </Tooltip>
        )}
      </>
    );
  }
}

export default VehicleSettings;
