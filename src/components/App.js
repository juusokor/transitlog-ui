import React, {Component} from "react";
import FilterBar from "./filterbar/FilterBar";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./map/JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import AreaHfpEvents from "./AreaHfpEvents";
import ErrorMessages from "./ErrorMessages";
import SharingModal from "./SharingModal";
import SelectedJourneyEvents from "./SelectedJourneyEvents";

const AppFrame = styled.main`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const AppGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 9rem 1fr auto;
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

@inject(app("Journey", "Filters", "UI"))
@observer
class App extends Component {
  render() {
    const {state, UI} = this.props;
    const {date, stop, route, shareModalOpen} = state;

    const hasRoute = !!route && !!route.routeId;

    return (
      <AppFrame>
        <AreaHfpEvents date={date} skip={hasRoute}>
          {({
            queryBounds,
            events: areaEvents = [],
            loading: areaEventsLoading,
            timeRange,
          }) => (
            <SelectedJourneyEvents>
              {({events: selectedJourneyEvents = [], loading}) => {
                let areaHfp = !hasRoute && areaEvents.length !== 0 ? areaEvents : [];

                // The currently fetched positions, either area hfp or selected journey hfp.
                const currentPositions =
                  areaHfp.length !== 0 ? areaHfp : selectedJourneyEvents;

                return (
                  <AppGrid>
                    <FilterBar
                      timeRange={timeRange}
                      areaEvents={areaHfp}
                      selectedJourneyEvents={selectedJourneyEvents}
                    />
                    <SidepanelAndMapWrapper>
                      <SidePanel
                        areaEventsLoading={areaEventsLoading}
                        loading={loading}
                        areaEvents={areaHfp}
                        selectedJourneyEvents={selectedJourneyEvents}
                        route={route}
                      />
                      <JourneyPosition positions={selectedJourneyEvents}>
                        {(journeyPosition) => (
                          <SingleStopQuery stop={stop} date={date}>
                            {({stop}) => {
                              const stopPosition = stop
                                ? latLng(stop.lat, stop.lon)
                                : false;

                              const centerPosition = stopPosition
                                ? stopPosition
                                : journeyPosition;

                              return (
                                <MapPanel center={centerPosition}>
                                  {({
                                    zoom,
                                    setMapBounds,
                                    setViewerLocation,
                                    mapView,
                                  }) => (
                                    <MapContent
                                      queryBounds={queryBounds}
                                      setMapBounds={setMapBounds}
                                      positions={currentPositions}
                                      route={route}
                                      stop={stop}
                                      zoom={zoom}
                                      viewLocation={setViewerLocation}
                                      stopsBbox={mapView}
                                    />
                                  )}
                                </MapPanel>
                              );
                            }}
                          </SingleStopQuery>
                        )}
                      </JourneyPosition>
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
}

export default App;
