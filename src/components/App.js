import React, {useMemo, useEffect} from "react";
import FilterBar from "./filterbar/FilterBar";
import {Observer, observer} from "mobx-react-lite";
import Map from "./map/Map";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import SelectedJourneyEvents from "./SelectedJourneyEvents";
import getJourneyId from "../helpers/getJourneyId";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import get from "lodash/get";
import {withRoute} from "../hoc/withRoute";
import AreaJourneys from "./AreaJourneys";
import MergedJourneys from "./MergedJourneys";
import Graph from "./map/Graph";
import LoginModal from "./LoginModal";
import RouteJourneys from "./RouteJourneys";
import {checkExistingSession, authorize} from "../auth/authService";
import {removeAuthParams} from "../stores/UrlManager";

const AppFrame = styled.main`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const AppGrid = styled.div`
  width: 100%;
  min-width: 1024px; // No, we are not mobile friendly
  height: 100vh;
  display: grid;
  grid-template-rows: 12.03rem 1fr;
  align-content: stretch;
  align-items: stretch;
`;

const SidepanelAndMapWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const MapPanel = styled(Map)`
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
`;

const GraphContainer = styled.div`
  background-color: white
  border: 1px solid var(--alt-grey);
  height: ${({journeyGraphOpen}) => (journeyGraphOpen ? "170px" : "0px")};
  border: ${({journeyGraphOpen}) =>
    journeyGraphOpen ? "1px solid var(--alt-grey)" : "none"};
  border-radius: 5px;
  position: absolute;
  width: 520px;
  box-sizing: content-box;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  z-index: 500;
  padding: ${({journeyGraphOpen}) => (journeyGraphOpen ? "0.5rem" : "0")};
`;

const decorate = flow(
  observer,
  withRoute,
  inject("UI")
);

function App({state, UI}) {
  const {
    date,
    stop: selectedStopId,
    route,
    shareModalOpen,
    selectedJourney,
    journeyDetailsOpen,
    sidePanelVisible,
    live,
    journeyGraphOpen,
    loginModalOpen,
  } = state;
  const selectedJourneyId = getJourneyId(selectedJourney);
  const code = useMemo(() => new URL(window.location.href).searchParams.get("code"), []);

  useEffect(() => {
    const auth = async () => {
      const response = await checkExistingSession();
      response && response.isOk && response.email
        ? UI.setUser(response.email)
        : UI.setUser(null);

      if (code) {
        const response = await authorize(code);

        if (response && response.isOk && response.email) {
          UI.setUser(response.email);
        }

        removeAuthParams();
      }
    };

    auth();
  }, [code]);

  return (
    <AppFrame>
      {loginModalOpen && <LoginModal />}
      <AreaJourneys>
        {({
          setQueryBounds,
          actualQueryBounds,
          journeys: areaJourneys = [],
          loading: areaJourneysLoading,
        }) => (
          <RouteJourneys>
            {({routeJourneys}) => (
              <SelectedJourneyEvents>
                {({journey: selectedJourney = null, loading: journeyLoading}) => (
                  <MergedJourneys
                    routeJourneys={routeJourneys}
                    areaJourneys={areaJourneys}
                    selectedJourney={selectedJourney}>
                    {({currentJourneys = [], withRouteJourneys = []}) => {
                      const sidePanelIsOpen = sidePanelVisible;

                      return (
                        <AppGrid>
                          <FilterBar journeys={currentJourneys} />
                          <SidepanelAndMapWrapper>
                            <SingleStopQuery date={date} stopId={selectedStopId}>
                              {({stop}) => (
                                <JourneyPosition date={date} journeys={withRouteJourneys}>
                                  {(currentJourneyPositions) => (
                                    <>
                                      <SidePanel
                                        areaJourneysLoading={!live && areaJourneysLoading}
                                        journeyLoading={journeyLoading}
                                        areaEvents={areaJourneys}
                                        journey={selectedJourney}
                                        stop={stop}
                                        sidePanelOpen={sidePanelIsOpen}
                                      />
                                      <MapPanel
                                        detailsOpen={journeyDetailsOpen}
                                        sidePanelOpen={sidePanelIsOpen}>
                                        {({
                                          zoom,
                                          setMapView,
                                          getMapView,
                                          setViewerLocation,
                                        }) => (
                                          <>
                                            <Observer>
                                              {() => {
                                                // Set the map center from a selected stop position or selected selectedJourney position.
                                                if (!live) {
                                                  const stopPosition = stop
                                                    ? latLng([stop.lat, stop.lng])
                                                    : false;

                                                  const selectedJourneyPosition =
                                                    selectedJourney &&
                                                    currentJourneyPositions.size === 1
                                                      ? currentJourneyPositions.get(
                                                          selectedJourneyId
                                                        ) || false
                                                      : false;

                                                  const {lat, lng} =
                                                    selectedJourneyPosition || {};

                                                  const centerPosition =
                                                    lat && lng
                                                      ? latLng([lat, lng])
                                                      : stopPosition;

                                                  if (centerPosition) {
                                                    setMapView(centerPosition);
                                                  }
                                                }

                                                return null;
                                              }}
                                            </Observer>
                                            <MapContent
                                              centerOnRoute={areaJourneys.length === 0}
                                              setQueryBounds={setQueryBounds}
                                              actualQueryBounds={actualQueryBounds}
                                              setMapView={setMapView}
                                              routeJourneys={routeJourneys}
                                              journeys={currentJourneys}
                                              journeyPositions={currentJourneyPositions}
                                              route={route}
                                              stop={stop}
                                              zoom={zoom}
                                              viewLocation={setViewerLocation}
                                              mapBounds={getMapView()}
                                            />
                                            {selectedJourney && (
                                              <GraphContainer
                                                journeyGraphOpen={
                                                  get(selectedJourney, "departures", [])
                                                    .length !== 0 && journeyGraphOpen
                                                }>
                                                <Graph
                                                  width={530}
                                                  departures={get(
                                                    selectedJourney,
                                                    "departures",
                                                    []
                                                  )}
                                                  events={get(
                                                    selectedJourney,
                                                    "events",
                                                    []
                                                  )}
                                                  graphExpanded={
                                                    get(
                                                      selectedJourney,
                                                      "departures",
                                                      []
                                                    ) !== 0 && journeyGraphOpen
                                                  }
                                                />
                                              </GraphContainer>
                                            )}
                                          </>
                                        )}
                                      </MapPanel>
                                    </>
                                  )}
                                </JourneyPosition>
                              )}
                            </SingleStopQuery>
                          </SidepanelAndMapWrapper>
                        </AppGrid>
                      );
                    }}
                  </MergedJourneys>
                )}
              </SelectedJourneyEvents>
            )}
          </RouteJourneys>
        )}
      </AreaJourneys>
      <ErrorMessages />
      <SharingModal isOpen={shareModalOpen} onClose={() => UI.toggleShareModal(false)} />
    </AppFrame>
  );
}

export default decorate(App);
