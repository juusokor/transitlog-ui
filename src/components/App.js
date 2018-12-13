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

const AppFrame = styled.main`
  display: grid;
  grid-template-columns: 25rem 1fr;
  grid-template-rows: 9rem 1fr;
  justify-content: stretch;
  transition: all 0.15s ease-out;
  overflow: hidden;
  height: 100%;
`;

const MapPanel = styled(Map)`
  top: 9rem;
  left: 25rem;
  width: calc(100% - 25rem);
  height: calc(100% - 9rem);
`;

@inject(app("Journey", "Filters"))
@observer
class App extends Component {
  state = {
    stopsBbox: null,
  };

  setStopsBbox = (map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();
    const {stopsBbox} = this.state;

    if (
      !bounds ||
      !invoke(bounds, "isValid") ||
      (stopsBbox !== null && bounds.equals(stopsBbox))
    ) {
      return;
    }

    this.setState({
      stopsBbox: bounds,
    });
  };

  render() {
    const {state} = this.props;
    const {date, stop, route} = state;
    const {stopsBbox} = this.state;

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
