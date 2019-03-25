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
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import SelectedJourneyEvents from "./SelectedJourneyEvents";
import getJourneyId from "../helpers/getJourneyId";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import get from "lodash/get";
import compact from "lodash/compact";
import {mergeJourneys} from "../helpers/mergeJourneys";
import {withRoute} from "../hoc/withRoute";

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
  } = state;
  const selectedJourneyId = getJourneyId(selectedJourney);

  return (
    <AppFrame>
      {/*<AreaHfpEvents selectedJourney={selectedJourney} date={date}>
        {({
          setQueryBounds,
          actualQueryBounds,
          events: areaEvents = [],
          loading: areaEventsLoading,
        }) => (*/}
      <SelectedJourneyEvents>
        {({journey: selectedJourney = null, loading: journeyLoading}) => {
          // The currently fetched positions, either area hfp or selected selectedJourney hfp.
          const journeyEvents = get(selectedJourney, "events", []);
          const areaJourneys = [];
          const setQueryBounds = () => {};
          const actualQueryBounds = null;

          const currentJourneys = mergeJourneys(
            compact([selectedJourney, ...areaJourneys])
          );

          const detailsAreOpen = selectedJourney && journeyDetailsOpen;
          const sidePanelIsOpen = sidePanelVisible;

          return (
            <AppGrid>
              <FilterBar events={journeyEvents} />
              <SidepanelAndMapWrapper>
                <SingleStopQuery date={date} stopId={selectedStopId}>
                  {({stop}) => (
                    <JourneyPosition date={date} journeys={currentJourneys}>
                      {(currentJourneyPositions) => (
                        <>
                          <SidePanel
                            areaEventsLoading={false}
                            journeyLoading={journeyLoading}
                            areaEvents={areaJourneys}
                            journey={selectedJourney}
                            stop={stop}
                            detailsOpen={detailsAreOpen}
                            sidePanelOpen={sidePanelIsOpen}
                          />
                          <MapPanel
                            detailsOpen={detailsAreOpen}
                            sidePanelOpen={sidePanelIsOpen}>
                            {({zoom, setMapView, getMapView, setViewerLocation}) => (
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
                                          ? currentJourneyPositions.get(selectedJourneyId)
                                          : false;

                                      const {lat, lng} = selectedJourneyPosition || {};

                                      const centerPosition =
                                        lat && lng ? latLng([lat, lng]) : stopPosition;

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
                                  journeys={currentJourneys}
                                  journeyPositions={currentJourneyPositions}
                                  route={route}
                                  stop={stop}
                                  zoom={zoom}
                                  viewLocation={setViewerLocation}
                                  mapBounds={getMapView()}
                                />
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
      </SelectedJourneyEvents>
      {/*)}
      </AreaHfpEvents>*/}
      <ErrorMessages />
      <SharingModal isOpen={shareModalOpen} onClose={() => UI.toggleShareModal(false)} />
    </AppFrame>
  );
}

export default decorate(App);
