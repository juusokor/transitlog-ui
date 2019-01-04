import React, {Component} from "react";
import FilterBar from "./filterbar/FilterBar";
import RouteHfpEvents from "./RouteHfpEvents";
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

const AppFrame = styled.main`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 9rem 1fr;
`;

const SidepanelAndMapWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const MapPanel = styled(Map)`
  flex: 1 1 auto;
  width: 100%;
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
        <AreaHfpEvents>
          {({queryBounds, events: areaEvents = [], timeRange}) => (
            <RouteHfpEvents>
              {({positions: routeEvents = [], loading}) => {
                let positions =
                  !hasRoute && areaEvents.length !== 0
                    ? areaEvents
                    : hasRoute && routeEvents.length
                    ? routeEvents
                    : [];

                return (
                  <>
                    <FilterBar timeRange={timeRange} positions={positions} />
                    <SidepanelAndMapWrapper>
                      <SidePanel
                        loading={loading}
                        positions={positions}
                        route={route}
                      />
                      <JourneyPosition positions={positions}>
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
                  </>
                );
              }}
            </RouteHfpEvents>
          )}
        </AreaHfpEvents>
      </AppFrame>
    );
  }
}

export default App;
