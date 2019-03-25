import React, {Component} from "react";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import {observer, inject} from "mobx-react";
import styled from "styled-components";
import TimeSlider from "./TimeSlider";
import AdditionalTimeSettings from "./AdditionalTimeSettings";
import LineSettings from "./LineSettings";
import FilterSection from "./FilterSection";
import Header from "./Header";
import VehicleSettings from "./VehicleSettings";
import StopSettings from "./StopSettings";
import {app} from "mobx-app";

const SiteHeader = styled(Header)`
  flex: 0 0 auto;
  z-index: 1;
  width: 26rem;
  height: 100%;
`;

const FilterBarWrapper = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  border-bottom: 1px solid var(--alt-grey);
  overflow: visible;
  height: 100%;
  display: flex;
  flex: 1 1 calc(100% - 26rem);
  flex-direction: row;
  position: relative;
`;

const FilterBarGrid = styled.div`
  display: grid;
  grid-template-columns: 21rem repeat(3, 1fr);
  height: 100%;
  width: 100%;
  align-items: stretch;
`;

const BottomSlider = styled(TimeSlider)`
  position: absolute;
  bottom: -1rem;
  right: 0;
  width: calc((100% - 26rem) + 2px);
  z-index: 10;
`;

const CalendarRoot = styled.div`
  position: absolute;
  z-index: 100;
  top: 4.25rem;
  margin-left: 2.5rem;
`;

@inject(app("state"))
@observer
class FilterBar extends Component {
  calendarRootRef = React.createRef();

  render() {
    const {state, journeys = []} = this.props;
    const {sidePanelVisible: visible} = state;

    return (
      <FilterBarWrapper visible={visible}>
        <SiteHeader />
        <FilterBarGrid>
          <FilterSection scrollable={true}>
            <DateSettings calendarRootRef={this.calendarRootRef} />
            <TimeSettings />
            <AdditionalTimeSettings />
          </FilterSection>
          {/*
            The datepicker calendar needs to be outside the scrollable filtersection.
            The CalendarRoot is the mount point for the calendar portal.
           */}
          <CalendarRoot ref={this.calendarRootRef} />
          <FilterSection>
            <LineSettings />
          </FilterSection>
          <FilterSection>
            <VehicleSettings />
          </FilterSection>
          <FilterSection>
            <StopSettings />
          </FilterSection>
        </FilterBarGrid>
        <BottomSlider journeys={journeys} />
      </FilterBarWrapper>
    );
  }
}

export default FilterBar;
