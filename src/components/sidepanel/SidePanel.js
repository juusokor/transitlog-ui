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
import JourneyDetails from "./journeyDetails/JourneyDetails";
import Info from "../../icons/Info";

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
  right: -1.5rem;
  top: 50%;
  padding: 0 0.25rem 0 0;
  transform: translateY(calc(-100% - 0.5rem));
  color: white;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;

  svg {
    transition: transform 0.5s ease-out;
    transform: rotate(${({isVisible = true}) => (isVisible ? 0 : "180deg")});
  }
`;

const ToggleJourneyDetailsButton = styled(ToggleSidePanelButton)`
  transform: translateY(0);
  padding: 0 0.1rem 0 0;

  svg {
    transform: none;
  }
`;

const JourneyPanel = styled.div`
  position: absolute;
  z-index: 0;
  top: 0;
  transition: all 0.2s ease-out;
  right: calc(-25rem - 1px);
  transform: translateX(${({visible}) => (visible ? "0" : "-100%")});
  width: 25rem;
  height: 100%;
  background: white;
  border-right: 1px solid var(--alt-grey);
  display: flex;
  flex-direction: column;
`;

@inject(app("UI"))
@observer
class SidePanel extends Component {
  @observable
  journeyDetailsOpen = true;

  toggleJourneyDetails = action((setTo = !this.journeyDetailsOpen) => {
    this.journeyDetailsOpen = setTo;
  });

  render() {
    const {
      UI: {toggleSidePanel},
      positions = [],
      loading,
      state: {stop, route, vehicle, sidePanelVisible},
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
              positions={positions}
              onToggle={this.toggleJourneyDetails}
            />
          )}
          <ToggleJourneyDetailsButton
            isVisible={this.journeyDetailsOpen}
            onClick={() => this.toggleJourneyDetails()}>
            <Info fill="white" height="1rem" width="1rem" />
          </ToggleJourneyDetailsButton>
        </JourneyPanel>
        <ToggleSidePanelButton
          isVisible={sidePanelVisible}
          onClick={() => toggleSidePanel()}>
          <ArrowLeft fill="white" height="1.2rem" width="1.2rem" />
        </ToggleSidePanelButton>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
