import React, {Component} from "react";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import RouteInput from "./RouteInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import Header from "./Header";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import VehicleInput from "./VehicleInput";
import {Text} from "../../helpers/text";
import styled, {css} from "styled-components";
import {Button} from "../Forms";
import moment from "moment-timezone";
import get from "lodash/get";
import last from "lodash/last";
import TimeSlider from "./TimeSlider";

const FilterBarWrapper = styled.div`
  width: 100%;
  background: var(--lightest-grey);
  color: var(--dark-grey);
  border-bottom: 1px solid var(--alt-grey);
  position: relative;
`;

const FilterBarGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

const FilterSection = styled.div`
  width: 100%;
  border-right: 1px solid var(--alt-grey);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BottomSlider = styled(TimeSlider)`
  position: absolute;
  bottom: calc(-1rem - 6px);
  left: -2px;
  width: 100%;
  z-index: 100;
`;

@inject(app("Filters", "UI"))
@observer
class FilterBar extends Component {
  onChangeQueryVehicle = (value) => {
    this.props.Filters.setVehicle(value);
  };

  render() {
    const {state, Filters} = this.props;
    const {vehicle, stop, route, line, date, filterPanelVisible: visible} = state;

    return (
      <FilterBarWrapper visible={visible}>
        <FilterBarGrid>
          <FilterSection>
            <AllLinesQuery date={date}>
              {({lines, loading, error}) => {
                if (loading || error) {
                  return null;
                }

                return (
                  <LineInput line={line} onSelect={Filters.setLine} lines={lines} />
                );
              }}
            </AllLinesQuery>
            {line.lineId &&
              line.dateBegin && (
                <RoutesByLineQuery
                  key={`line_route_${Object.values(line).join("_")}`}
                  date={date}
                  line={line}>
                  {({routes, loading, error}) => {
                    if (loading || error) {
                      return null;
                    }

                    return <RouteInput route={route} routes={routes} />;
                  }}
                </RoutesByLineQuery>
              )}
          </FilterSection>
          <FilterSection>
            <DateSettings />
          </FilterSection>
          <FilterSection>
            <TimeSettings />
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
