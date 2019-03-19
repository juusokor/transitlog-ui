import React from "react";
import {observer} from "mobx-react-lite";
import Journeys from "./Journeys";
import styled from "styled-components";
import Tabs from "./Tabs";
import TimetablePanel from "./TimetablePanel";
import VehicleJourneys from "./VehicleJourneys";
import {text} from "../../helpers/text";
import AreaJourneyList from "./AreaJourneyList";
import JourneyDetails from "./journeyDetails/JourneyDetails";
import Info from "../../icons/Info";
import {createRouteId} from "../../helpers/keys";
import Timetable from "../../icons/Timetable";
import ControlBar from "./ControlBar";
import {UsageInstructions} from "./UsageInstructions";
import Tooltip from "../Tooltip";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  height: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  margin-left: ${({visible}) =>
    visible ? 0 : "-26rem"}; // Makes the map area larger when the sidebar is hidden
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
  padding: 0 0.1rem 0;
  transform: translateY(calc(-100% - 0.5rem));
  color: white;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s ease-out;

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
  width: 26rem;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr;
  flex-direction: column;
`;

const JourneyPanel = styled.div`
  transition: margin-left 0.2s ease-out;
  margin-left: ${({visible}) =>
    visible ? 0 : "-25rem"}; // Makes the map area larger when the sidebar is hidden
  width: 25rem;
  height: 100%;
  background: white;
  border-right: 1px solid var(--alt-grey);
`;

const decorate = flow(
  observer,
  inject("UI")
);

const SidePanel = decorate((props) => {
  const {
    UI: {toggleSidePanel, toggleJourneyDetails},
    areaEvents = [],
    selectedJourneyEvents = [],
    journeyStops,
    journeyEventsLoading = false,
    areaEventsLoading = false,
    stopTimesLoading = false,
    stop,
    state: {
      language,
      route,
      date,
      vehicle,
      stop: stateStop,
      selectedJourney,
      sidePanelVisible,
      journeyDetailsAreOpen,
      journeyDetailsCanOpen,
    },
  } = props;

  const hasRoute = !!route && !!route.routeId;
  const hasEvents = !journeyEventsLoading && selectedJourneyEvents.length !== 0;

  // Figure out which tab is suggested. It will not be outright selected, but
  // if it appears and nothing else is selected then it will be.
  let suggestedTab = "";

  if ((!hasRoute && !vehicle) || (areaEvents.length !== 0 || areaEventsLoading))
    suggestedTab = "area-journeys";
  if (hasRoute) suggestedTab = "journeys";
  if (vehicle) suggestedTab = "vehicle-journeys";
  if (selectedJourney) suggestedTab = "journeys";
  if (stateStop) suggestedTab = "timetables";

  const allTabsHidden =
    !hasRoute &&
    (areaEvents.length === 0 && !areaEventsLoading) &&
    !vehicle &&
    !stateStop;

  return (
    <SidePanelContainer visible={sidePanelVisible}>
      <MainSidePanel>
        <ControlBar />
        {allTabsHidden ? (
          <UsageInstructions language={language} />
        ) : (
          <Tabs suggestedTab={suggestedTab}>
            {(areaEvents.length !== 0 || areaEventsLoading) && (
              <AreaJourneyList
                helpText="Area search tab"
                loading={areaEventsLoading}
                journeys={areaEvents}
                name="area-journeys"
                label={text("sidepanel.tabs.area_events")}
              />
            )}
            {hasRoute && (
              <Journeys
                helpText="Journeys tab"
                key={`route_journeys_${createRouteId(route, true)}_${date}`}
                route={route}
                loading={journeyEventsLoading}
                name="journeys"
                label={text("sidepanel.tabs.journeys")}
              />
            )}
            {vehicle && (
              <VehicleJourneys
                helpText="Vehicle journeys tab"
                loading={journeyEventsLoading}
                name="vehicle-journeys"
                label={text("sidepanel.tabs.vehicle_journeys")}
              />
            )}
            {stateStop && (
              <TimetablePanel
                helpText="Timetable tab"
                stop={stop}
                loading={journeyEventsLoading}
                name="timetables"
                label={text("sidepanel.tabs.timetables")}
              />
            )}
          </Tabs>
        )}
      </MainSidePanel>
      <JourneyPanel visible={journeyDetailsAreOpen}>
        {/* The content of the sidebar is independent from the sidebar wrapper so that we can animate it. */}
        {journeyDetailsAreOpen && (
          <JourneyDetails
            loading={stopTimesLoading || journeyEventsLoading}
            journeyStops={journeyStops}
            selectedJourneyEvents={selectedJourneyEvents}
          />
        )}
        {hasEvents && journeyDetailsCanOpen && (
          <Tooltip helpText="Toggle journey details button">
            <ToggleJourneyDetailsButton
              isVisible={journeyDetailsAreOpen}
              onClick={() => toggleJourneyDetails()}>
              <Info fill="white" height="1rem" width="1rem" />
            </ToggleJourneyDetailsButton>
          </Tooltip>
        )}
      </JourneyPanel>
      <Tooltip helpText="Toggle sidebar button">
        <ToggleSidePanelButton
          isVisible={sidePanelVisible}
          onClick={() => toggleSidePanel()}>
          <Timetable fill="white" height="1.2rem" width="1rem" />
        </ToggleSidePanelButton>
      </Tooltip>
    </SidePanelContainer>
  );
});

export default SidePanel;
