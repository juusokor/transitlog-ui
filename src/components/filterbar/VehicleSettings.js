import React from "react";
import {text} from "../../helpers/text";
import {ControlGroup} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import Input from "../Input";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import VehicleOptionsQuery from "../../queries/VehicleOptionsQuery";
import operators from "../../operators.json";

function getOperatorName(operatorId) {
  return get(operators, operatorId, operatorId);
}

@inject(app("Filters"))
@observer
class VehicleSettings extends React.Component {
  onChangeQueryVehicle = (value) => {
    this.props.Filters.setVehicle(get(value, "unique_vehicle_id", ""));
  };

  render() {
    const {state} = this.props;
    const {vehicle = "", date, route} = state;

    return (
      <VehicleOptionsQuery date={date} route={route}>
        {({vehicles}) => {
          const groupedVehicles = map(
            groupBy(vehicles, ({owner_operator_id}) => owner_operator_id),
            (vehicles, operatorId) => {
              return {
                operatorName: getOperatorName(operatorId),
                operatorId: operatorId,
                vehicles,
              };
            }
          );

          return (
            <ControlGroup>
              <Input
                label={text("filterpanel.filter_by_vehicle")}
                animatedLabel={false}>
                <VehicleInput
                  options={groupedVehicles}
                  value={vehicle}
                  onSelect={this.onChangeQueryVehicle}
                />
              </Input>
            </ControlGroup>
          );
        }}
      </VehicleOptionsQuery>
    );
  }
}

export default VehicleSettings;
