import React from "react";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import Tooltip from "../Tooltip";

@inject(app("Filters"))
@observer
class VehicleSettings extends React.Component {
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
    const {state, Filters} = this.props;
    const {vehicle = "", date, selectedJourney} = state;

    const isDisabled = !!selectedJourney;

    if (isDisabled) {
      return this.renderInput(undefined, vehicle, true);
    }

    return (
      <>
        <VehicleOptionsQuery date={date}>
          {({vehicles, search}) =>
            this.renderInput(
              <VehicleInput
                search={search}
                options={vehicles}
                value={vehicle}
                onSelect={this.onSelectVehicle}
              />,
              vehicle
            )
          }
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
  }
}

export default VehicleSettings;
