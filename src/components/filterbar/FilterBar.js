import React, {Component} from "react";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import RouteInput from "./RouteInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import styled from "styled-components";
import TimeSlider from "./TimeSlider";
import SimulationSettings from "./SimulationSettings";
import LineSettings from "./LineSettings";

const FilterBarWrapper = styled.div`
  width: 100%;
  background: var(--lightest-grey);
  color: var(--dark-grey);
  border-bottom: 1px solid var(--alt-grey);
  position: relative;
`;

const FilterBarGrid = styled.div`
  display: grid;
  grid-template-columns: 25rem 25rem 25rem;
`;

const FilterSection = styled.div`
  width: 100%;
  border-right: 1px solid var(--alt-grey);
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SectionVisible = styled.div``;

const SectionExpandable = styled.div`
  display: none;
`;

const BottomSlider = styled(TimeSlider)`
  position: absolute;
  bottom: calc(-1rem - 6px);
  left: -3px;
  width: calc(100% + 2px);
  z-index: 10;
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
          <FilterSection>
            <SectionVisible>
              <DateSettings />
              <TimeSettings />
            </SectionVisible>
            <SectionExpandable>
              <SimulationSettings />
            </SectionExpandable>
          </FilterSection>
          <FilterSection>
            <LineSettings />
          </FilterSection>
          <FilterSection>
            <VehicleInput value={vehicle} onSelect={this.onChangeQueryVehicle} />
            {!route.routeId ? (
              <AllStopsQuery key="all_stops">
                {({stops}) => (
                  <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
                )}
              </AllStopsQuery>
            ) : (
              <StopsByRouteQuery key="stop_input_by_route" route={route}>
                {({stops}) => (
                  <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
                )}
              </StopsByRouteQuery>
            )}
          </FilterSection>
        </FilterBarGrid>
        <BottomSlider />
      </FilterBarWrapper>
    );
  }
}

export default FilterBar;
