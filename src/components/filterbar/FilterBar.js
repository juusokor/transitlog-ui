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
import TimeSlider, {TIME_SLIDER_MIN, TIME_SLIDER_MAX} from "./TimeSlider";
import AdditionalTimeSettings from "./AdditionalTimeSettings";
import LineSettings from "./LineSettings";
import Input from "../Input";
import {ControlGroup} from "../Forms";
import {text} from "../../helpers/text";
import FilterSection from "./FilterSection";
import Header from "./Header";
import {
  getTimeRangeFromPositions,
  dateToSeconds,
} from "../../helpers/getTimeRangeFromPositions";
import getJourneyId from "../../helpers/getJourneyId";
import get from "lodash/get";
import VehicleSettings from "./VehicleSettings";

const SiteHeader = styled(Header)`
  flex: 0 0 auto;
  z-index: 1;
  width: 25rem;
  height: 100%;
`;

const FilterBarWrapper = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  border-bottom: 1px solid var(--alt-grey);
  overflow: visible;
  height: 100%;
  display: flex;
  flex: 1 1 calc(100% - 25rem);
  flex-direction: row;
  position: relative;
`;

const FilterBarGrid = styled.div`
  display: grid;
  grid-template-columns: 23rem 1fr 1fr 1fr;
  height: 100%;
  align-items: stretch;
`;

const BottomSlider = styled(TimeSlider)`
  position: absolute;
  bottom: -1rem;
  right: 0;
  width: calc((100% - 25rem) + 2px);
  z-index: 10;
`;

@inject(app("Filters"))
@observer
class FilterBar extends Component {
  render() {
    const {state, Filters, positions = [], timeRange = null} = this.props;
    const {selectedJourney, stop, route, sidePanelVisible: visible} = state;

    const selectedJourneyId = getJourneyId(selectedJourney);
    let selectedJourneyPositions = [];

    if (selectedJourneyId && positions.length !== 0) {
      selectedJourneyPositions = get(
        positions.find(({journeyId}) => journeyId === selectedJourneyId),
        "positions",
        []
      );
    }

    const useTimeRange =
      (!route || !route.routeId) && timeRange
        ? {
            min: dateToSeconds(timeRange.min),
            max: dateToSeconds(timeRange.max),
          }
        : selectedJourneyPositions.length !== 0
        ? getTimeRangeFromPositions(
            selectedJourneyPositions,
            TIME_SLIDER_MIN,
            TIME_SLIDER_MAX
          )
        : {};

    return (
      <FilterBarWrapper visible={visible}>
        <SiteHeader />
        <FilterBarGrid>
          <FilterSection expandable={<AdditionalTimeSettings />}>
            <DateSettings />
            <TimeSettings />
          </FilterSection>
          <FilterSection>
            <LineSettings />
          </FilterSection>
          <FilterSection>
            <VehicleSettings positions={positions} />
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
                  <StopsByRouteQuery
                    key={`stop_input_by_route_${route.routeId}`}
                    route={route}>
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
        <BottomSlider {...useTimeRange} />
      </FilterBarWrapper>
    );
  }
}

export default FilterBar;
