import React from "react";
import {text} from "../../helpers/text";
import {ControlGroup} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";

@inject(app("Filters"))
@observer
class VehicleSettings extends React.Component {
  onChangeQueryVehicle = (value) => {
    this.props.Filters.setVehicle(value);
  };

  render() {
    const {positions, state} = this.props;
    const {vehicle, date} = state;

    return (
      <VehicleOptionsQuery date={date}>
        {({vehicles}) => (
          <ControlGroup>
            {console.log(vehicles)}
            <Input
              label={text("filterpanel.filter_by_vehicle")}
              animatedLabel={false}>
              <VehicleInput
                positions={positions}
                value={vehicle}
                onSelect={this.onChangeQueryVehicle}
              />
            </Input>
          </ControlGroup>
        )}
      </VehicleOptionsQuery>
    );
  }
}

export default VehicleSettings;
