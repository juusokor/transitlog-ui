import React, {Component} from "react";
import StopInput from "./StopInput";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import styled from "styled-components";
import TimeSlider from "./TimeSlider";
import SimulationSettings from "./SimulationSettings";
import LineSettings from "./LineSettings";
import Input from "../Input";
import {ControlGroup} from "../Forms";
import {text} from "../../helpers/text";
import FilterSection from "./FilterSection";

const FilterBarWrapper = styled.div`
  width: 100%;
  background: var(--lightest-grey);
  color: var(--dark-grey);
  border-bottom: 1px solid var(--alt-grey);
  position: relative;
  overflow: visible;
`;

const FilterBarGrid = styled.div`
  display: grid;
  grid-template-columns: 22rem 1fr 1fr 1fr;
  height: 100%;
  align-items: stretch;
`;

const BottomSlider = styled(TimeSlider)`
  position: absolute;
  bottom: calc(-1rem - 4px);
  left: -2px;
  width: calc(100% + 2px);
  z-index: 20;
`;

@inject(app("Filters", "UI"))
@observer
class FilterBar extends Component {
  onChangeQueryVehicle = (value) => {
    this.props.Filters.setVehicle(value);
  };

  render() {
    const {state, Filters} = this.props;
    const {vehicle, stop, route, filterPanelVisible: visible} = state;

    return (
      <FilterBarWrapper visible={visible}>
        <FilterBarGrid>
          <FilterSection expandable={<SimulationSettings />}>
            <DateSettings />
            <TimeSettings />
          </FilterSection>
          <FilterSection>
            <LineSettings />
          </FilterSection>
          <FilterSection>
            <ControlGroup>
              <Input
                label={text("filterpanel.filter_by_vehicle")}
                animatedLabel={false}>
                <VehicleInput value={vehicle} onSelect={this.onChangeQueryVehicle} />
              </Input>
            </ControlGroup>
          </FilterSection>
          <FilterSection>
            <ControlGroup>
              <Input
                label={text("filterpanel.filter_by_stop")}
                animatedLabel={false}>
                {!route.routeId ? (
                  <AllStopsQuery key="all_stops">
                    {({stops}) => (
                      <StopInput
                        onSelect={Filters.setStop}
                        stop={stop}
                        stops={stops}
                      />
                    )}
                  </AllStopsQuery>
                ) : (
                  <StopsByRouteQuery key="stop_input_by_route" route={route}>
                    {({stops}) => (
                      <StopInput
                        onSelect={Filters.setStop}
                        stop={stop}
                        stops={stops}
                      />
                    )}
                  </StopsByRouteQuery>
                )}
              </Input>
            </ControlGroup>
          </FilterSection>
        </FilterBarGrid>
        <BottomSlider />
      </FilterBarWrapper>
    );
  }
}

export default FilterBar;
