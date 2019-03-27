import React from "react";
import FilterBar from "./filterbar/FilterBar";
import {Observer, observer} from "mobx-react-lite";
import Map from "./map/Map";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import AreaHfpEvents from "./AreaHfpEvents";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import SelectedJourneyEvents from "./SelectedJourneyEvents";
import getJourneyId from "../helpers/getJourneyId";
import JourneyStopTimes from "./JourneyStopTimes";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import withRoute from "../hoc/withRoute";
import {mergeJourneyEvents} from "../helpers/mergeJourneyEvents";
import {getJourneyAverageSpeeds} from "../helpers/getJourneyAverageSpeeds";
import {getJourneyStopDiffs} from "../helpers/getJourneyStopDiffs";
import Graph from "./sidepanel/journeyDetails/Graph";

const AppFrame = styled.main`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const AppGrid = styled.div`
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-rows: 9rem 1fr;
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
  background-color: white;
  border: 1px solid var(--alt-grey);
  height: ${({journeyGraphOpen}) => (journeyGraphOpen ? "170px;" : "0px;")};
  border: ${({journeyGraphOpen}) =>
    journeyGraphOpen ? "1px solid var(--alt-grey);" : "none;"};
  border-radius: 5px;
  position: absolute;
  left: 25%;
  right: 25%;
  bottom: 5%;
  z-index: 500;
`;

const decorate = flow(
  observer,
  withRoute(),
  inject("UI")
);

function App({state, UI}) {
  const {
    date,
    stop: selectedStopId,
    route,
    shareModalOpen,
    selectedJourney,
    live,
    journeyGraphOpen,
  } = state;
  const selectedJourneyId = getJourneyId(selectedJourney);

  return (
    <AppFrame>
      <AreaHfpEvents selectedJourney={selectedJourney} date={date}>
        {({
          setQueryBounds,
          actualQueryBounds,
          events: areaEvents = [],
          loading: areaEventsLoading,
        }) => (
          <SelectedJourneyEvents>
            {({
              events: selectedJourneyEvents = [],
              loading: journeyEventsLoading,
            }) => {
              // The currently fetched positions, either area hfp or selected journey hfp.
              const allCurrentPositions = mergeJourneyEvents(
                selectedJourneyEvents,
                areaEvents
              );

              return (
                <AppGrid>
                  <FilterBar currentPositions={allCurrentPositions} />
                  <SidepanelAndMapWrapper>
                    <SingleStopQuery date={date} stop={selectedStopId}>
                      {({stop}) => (
                        <JourneyStopTimes
                          selectedJourneyEvents={selectedJourneyEvents}>
                          {({journeyStops = [], loading: stopTimesLoading}) => (
                            <JourneyPosition
                              date={date}
                              positions={allCurrentPositions}>
                              {(currentTimePositions) => (
                                <>
                                  <SidePanel
                                    areaEventsLoading={areaEventsLoading}
                                    journeyEventsLoading={journeyEventsLoading}
                                    stopTimesLoading={stopTimesLoading}
                                    areaEvents={areaEvents}
                                    selectedJourneyEvents={selectedJourneyEvents}
                                    journeyStops={journeyStops}
                                    journeyPositions={currentTimePositions}
                                    route={route}
                                    stop={stop}
                                  />
                                  <MapPanel>
                                    {({
                                      zoom,
                                      setMapView,
                                      getMapView,
                                      setViewerLocation,
                                    }) => (
                                      <>
                                        <Observer>
                                          {() => {
                                            // Set the map center from a selected stop position or selected journey position.

                                            if (!live) {
                                              const stopPosition = stop
                                                ? latLng([stop.lat, stop.lon])
                                                : false;

                                              const selectedJourneyPosition =
                                                selectedJourney &&
                                                currentTimePositions.size === 1
                                                  ? currentTimePositions.get(
                                                      selectedJourneyId
                                                    )
                                                  : false;

                                              const {lat, long} =
                                                selectedJourneyPosition || {};

                                              const centerPosition =
                                                lat && long
                                                  ? latLng([lat, long])
                                                  : stopPosition;

                                              if (centerPosition) {
                                                setMapView(centerPosition);
                                              }
                                            }

                                            return null;
                                          }}
                                        </Observer>
                                        <MapContent
                                          centerOnRoute={areaEvents.length === 0}
                                          setQueryBounds={setQueryBounds}
                                          actualQueryBounds={actualQueryBounds}
                                          setMapView={setMapView}
                                          journeys={allCurrentPositions}
                                          journeyStops={journeyStops}
                                          timePositions={currentTimePositions}
                                          route={route}
                                          stop={stop}
                                          zoom={zoom}
                                          viewLocation={setViewerLocation}
                                          mapBounds={getMapView()}
                                        />
                                        {journeyStops && (
                                          <GraphContainer
                                            journeyGraphOpen={
                                              journeyStops.length > 0 &&
                                              journeyGraphOpen
                                            }
                                            id="GraphContainer">
                                            <Graph
                                              diffs={getJourneyStopDiffs(
                                                journeyStops
                                              )}
                                              speedAverages={getJourneyAverageSpeeds(
                                                selectedJourneyEvents[0]
                                              )}
                                              graphExpanded={
                                                journeyStops.length > 0 &&
                                                journeyGraphOpen
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
                        </JourneyStopTimes>
                      )}
                    </SingleStopQuery>
                  </SidepanelAndMapWrapper>
                </AppGrid>
              );
            }}
          </SelectedJourneyEvents>
        )}
      </AreaHfpEvents>
      <ErrorMessages />
      <SharingModal
        isOpen={shareModalOpen}
        onClose={() => UI.toggleShareModal(false)}
      />
    </AppFrame>
  );
}

export default decorate(App);
