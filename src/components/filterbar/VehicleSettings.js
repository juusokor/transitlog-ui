import React from "react";
import Input from "./FilterBar";
import {text} from "../../helpers/text";
import {ControlGroup} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";

@inject(app("state"))
@observer
class VehicleSettings extends React.Component {
  render() {
    const {positions, state} = this.props;
    const {vehicle} = state;

    return (
      <ControlGroup>
        <Input label={text("filterpanel.filter_by_vehicle")} animatedLabel={false}>
          <VehicleInput
            positions={positions}
            value={vehicle}
            onSelect={this.onChangeQueryVehicle}
          />
        </Input>
      </ControlGroup>
    );
  }
}

export default VehicleSettings;
