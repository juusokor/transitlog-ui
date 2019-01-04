import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import Journeys from "./Journeys";
import styled from "styled-components";
import {app} from "mobx-app";
import Tabs from "./Tabs";
import get from "lodash/get";
import TimetablePanel from "./TimetablePanel";
import VehicleJourneys from "./VehicleJourneys";
import {text} from "../../helpers/text";
import AreaJourneyList from "./AreaJourneyList";
import ArrowLeft from "../../icons/ArrowLeft";
import {observable, action, reaction, computed} from "mobx";
import JourneyDetails from "./journeyDetails/JourneyDetails";
import Info from "../../icons/Info";
import getJourneyId from "../../helpers/getJourneyId";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  height: 100%;
  flex: 1 1 auto;
  position: relative;
  z-index: 1;
  display: flex;
  margin-left: ${({visible}) =>
    visible ? 0 : "-25rem"}; // Makes the map area larger when the sidebar is hidden
  transition: margin-left 0.2s ease-out;
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
  transition: transform 0.2s ease-out;

  svg {
    transition: transform 0.5s ease-out;
    transform: rotate(${({isVisible = true}) => (isVisible ? 0 : "180deg")});
  }

  &:hover {
    transform: scale(1.075) translateY(calc(-90% - 0.5rem));
  }
`;

const ToggleJourneyDetailsButton = styled(ToggleSidePanelButton)`
  transform: translateY(0);
  padding: 0 0.1rem 0 0;

  svg {
    transform: none;
  }

  &:hover {
    transform: scale(1.075) translateY(0);
  }
`;

const MainSidePanel = styled.div`
  height: 100%;
  border-right: 1px solid var(--alt-grey);
  width: 25rem;
`;

const JourneyPanel = styled.div`
  transition: margin-left 0.2s ease-out;
  margin-left: ${({visible}) =>
    visible ? 0 : "-25rem"}; // Makes the map area larger when the sidebar is hidden
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
  // This is a computed check to see if we have anything to show in the journey details sidebar.
  // When this returns false the sidebar will hide regardless of the journeyDetailsOpen setting.
  @computed
  get journeyDetailsCanOpen() {
    const {state} = this.props;

    const route_id = get(state, "selectedJourney.route_id", "");
    const direction_id = parseInt(
      get(state, "selectedJourney.direction_id", ""),
      10
    );
    const routeId = get(state, "route.routeId", "");
    const direction = parseInt(get(state, "route.direction", ""), 10);

    // Make sure the route of the selected journey matches the currently selected route.
    // Otherwise the journey details can open even though the user has not made a selection.
    return !!(
      route_id === routeId &&
      direction === direction_id &&
      getJourneyId(state.selectedJourney)
    );
  }

  render() {
    const {
      UI: {toggleSidePanel, toggleJourneyDetails},
      positions = [],
      loading,
      state: {stop, route, vehicle, sidePanelVisible, journeyDetailsOpen},
    } = this.props;

    const journeyDetailsAreOpen = this.journeyDetailsCanOpen && journeyDetailsOpen;

    return (
      <SidePanelContainer visible={sidePanelVisible}>
        <MainSidePanel>
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
        </MainSidePanel>
        <JourneyPanel visible={journeyDetailsAreOpen}>
          {/* The content of the sidebar is independent from the sidebar wrapper so that we can animate it. */}
          {journeyDetailsAreOpen && <JourneyDetails positions={positions} />}
          {this.journeyDetailsCanOpen && (
            <ToggleJourneyDetailsButton
              isVisible={journeyDetailsOpen}
              onClick={() => toggleJourneyDetails()}>
              <Info fill="white" height="1rem" width="1rem" />
            </ToggleJourneyDetailsButton>
          )}
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
