import React, {Component} from "react";
import FilterBar from "./filterbar/FilterBar";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import invoke from "lodash/invoke";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./map/JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import AreaHfpEvents from "./AreaHfpEvents";
import {observable, action} from "mobx";
import ErrorMessages from "./ErrorMessages";
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

@inject(app("Journey", "Filters"))
@observer
class App extends Component {
  @observable
  stopsBbox = null;

  setStopsBbox = action((map) => {
    if (!map) {
      return;
    }

    const {route} = this.props.state;

    if (route && route.routeId) {
      return;
    }

    const bounds = map.getBounds();
    const {stopsBbox} = this;

    if (
      !bounds ||
      !invoke(bounds, "isValid") ||
      (stopsBbox !== null && bounds.equals(stopsBbox))
    ) {
      return;
    }

    this.stopsBbox = bounds;
  });

  render() {
    const {state} = this.props;
    const {date, stop, route} = state;
    const {stopsBbox} = this;

    const hasRoute = !!route && !!route.routeId;

    return (
      <AppFrame>
        <AreaHfpEvents date={date} skip={hasRoute}>
          {({
            queryBounds,
            events: areaEvents = [],
            timeRange,
            loading: areaEventsLoading,
          }) => (
            <SelectedJourneyEvents>
              {({events: selectedJourneyEvents = [], loading}) => {
                let areaHfp = !hasRoute && areaEvents.length !== 0 ? areaEvents : [];

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

                              const positions =
                                areaHfp.length !== 0
                                  ? areaHfp
                                  : selectedJourneyEvents;

                              return (
                                <MapPanel
                                  viewBbox={stopsBbox}
                                  onMapChanged={this.setStopsBbox}
                                  center={centerPosition}>
                                  {({zoom, setMapBounds, setViewerLocation}) => (
                                    <MapContent
                                      queryBounds={queryBounds}
                                      setMapBounds={setMapBounds}
                                      positions={positions}
                                      route={route}
                                      stop={stop}
                                      zoom={zoom}
                                      viewLocation={setViewerLocation}
                                      stopsBbox={stopsBbox}
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
      </AppFrame>
    );
  }
}

export default App;
