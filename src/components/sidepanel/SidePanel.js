import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import Journeys from "./Journeys";
import styled from "styled-components";
import {app} from "mobx-app";
import Tabs from "./Tabs";
import TimetablePanel from "./TimetablePanel";
import VehicleJourneys from "./VehicleJourneys";
import {text} from "../../helpers/text";
import AreaJourneyList from "./AreaJourneyList";
import ArrowLeft from "../../icons/ArrowLeft";
import {observable, action} from "mobx";
import JourneyDetails from "./JourneyDetails";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  transition: margin-left 0.2s ease-out;
  border-right: 1px solid var(--alt-grey);
  height: 100%;
  flex: 1 1 auto;
  max-width: 25rem;
  position: relative;
  margin-left: ${({visible}) =>
    visible ? 0 : "-25rem"}; // Makes the map area larger when the sidebar is hidden
  z-index: 1;
`;

const ToggleSidePanelButton = styled.button`
  background: var(--blue);
  border: 0;
  outline: 0;
  width: 1.5rem;
  height: 3rem;
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  right: ${({journeyDetailsOpen}) =>
    journeyDetailsOpen ? "calc(-26.5rem + 0.5px)" : "-1.5rem"};
  top: 50%;
  padding: 0 0.25rem 0 0;
  transform: translateY(-50%);
  color: white;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;

  svg {
    transition: transform 0.5s ease-out;
    transform: rotate(${({isVisible = true}) => (isVisible ? 0 : "180deg")});
  }
`;

const JourneyPanel = styled.div`
  position: absolute;
  top: 0;
  transition: all 0.2s ease-out;
  right: calc(-25rem - 1px);
  transform: translateX(${({visible}) => (visible ? "0" : "-100%")});
  width: 25rem;
  height: 100%;
  background: white;
  z-index: 1;
  border-right: 1px solid var(--alt-grey);
  display: flex;
  flex-direction: column;
`;

@inject(app("UI"))
@observer
class SidePanel extends Component {
  @observable
  journeyDetailsOpen = true;

  @observable.ref
  selectedJourneyData = null;

  toggleJourneyDetails = action((setTo = !this.journeyDetailsOpen) => {
    this.journeyDetailsOpen = setTo;
  });

  onSelectJourney = action((journeyData) => {
    if (!journeyData) {
      this.toggleJourneyDetails(false);
      this.selectedJourneyData = null;

      return;
    }

    this.toggleJourneyDetails(true);
    this.selectedJourneyData = journeyData;
  });

  render() {
    const {
      UI: {toggleSidePanel},
      positions = [],
      loading,
      state: {stop, route, vehicle, selectedJourney, sidePanelVisible},
    } = this.props;

    return (
      <SidePanelContainer visible={sidePanelVisible}>
        {sidePanelVisible && (
          <Tabs>
            {(!route || !route.routeId) && positions.length !== 0 && (
              <AreaJourneyList
                journeys={positions}
                name="area-journeys"
                label={text("sidepanel.tabs.area_events")}
              />
            )}
            {!!route && !!route.routeId && (
              <Journeys
                onSelectJourney={this.onSelectJourney}
                route={route}
                positions={positions}
                loading={loading}
                name="journeys"
                label={text("sidepanel.tabs.journeys")}
              />
            )}
            {vehicle && (
              <VehicleJourneys
                loading={loading}
                name="vehicle-journeys"
                label={text("sidepanel.tabs.vehicle_journeys")}
              />
            )}
            {stop && (
              <TimetablePanel
                onSelectJourney={this.onSelectJourney}
                loading={loading}
                name="timetables"
                label={text("sidepanel.tabs.timetables")}
              />
            )}
          </Tabs>
        )}
        <JourneyPanel visible={this.journeyDetailsOpen}>
          {this.journeyDetailsOpen && (
            <JourneyDetails
              journey={this.selectedJourneyData}
              onToggle={this.toggleJourneyDetails}
            />
          )}
        </JourneyPanel>
        <ToggleSidePanelButton
          journeyDetailsOpen={this.journeyDetailsOpen}
          isVisible={sidePanelVisible}
          onClick={() => toggleSidePanel()}>
          <ArrowLeft fill="white" height="1.2rem" width="1.2rem" />
        </ToggleSidePanelButton>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
