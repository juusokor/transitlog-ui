import React, {Component} from "react";
import FilterBar from "./filterbar/FilterBar";
import withHfpData from "../hoc/withHfpData";
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
import {observable, action} from "mobx";
import QueryArea from "./map/QueryArea";

const DEFAULT_SIDEPANEL_WIDTH = 25;

const AppFrame = styled.main`
  display: grid;
  grid-template-columns: ${({sidepanelWidth = DEFAULT_SIDEPANEL_WIDTH}) =>
      sidepanelWidth}rem 1fr;
  grid-template-rows: 9rem 1fr;
  justify-content: stretch;
  transition: all 0.15s ease-out;
  overflow: hidden;
  height: 100%;
`;

const MapPanel = styled(Map)`
  top: 9rem;
  left: ${({sidepanelWidth = DEFAULT_SIDEPANEL_WIDTH}) => sidepanelWidth}rem;
  width: calc(
    100% - ${({sidepanelWidth = DEFAULT_SIDEPANEL_WIDTH}) => sidepanelWidth}rem
  );
  height: calc(100% - 9rem);
`;

@inject(app("Journey", "Filters"))
@withHfpData
@observer
class App extends Component {
  @observable
  stopsBbox = null;

  setStopsBbox = action((map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    if (
      !bounds ||
      !invoke(bounds, "isValid") ||
      (this.stopsBbox !== null && bounds.equals(this.stopsBbox))
    ) {
      return;
    }

    this.stopsBbox = bounds;
  });

  render() {
    const {state, positions = [], loading} = this.props;
    const {date, stop, route} = state;

    return (
      <AppFrame>
        <FilterBar positions={positions} />
        <SidePanel loading={loading} positions={positions} route={route} />
        <JourneyPosition positions={positions}>
          {(journeyPosition) => (
            <SingleStopQuery stop={stop} date={date}>
              {({stop}) => {
                const stopPosition = stop ? latLng(stop.lat, stop.lon) : false;
                const centerPosition = stopPosition ? stopPosition : journeyPosition;

                return (
                  <MapPanel
                    viewBbox={this.stopsBbox}
                    onMapChanged={this.setStopsBbox}
                    center={centerPosition}>
                    {({zoom, setMapBounds}) => (
                      <QueryArea>
                        {({queryBounds, events}) => (
                          <MapContent
                            queryBounds={queryBounds}
                            setMapBounds={setMapBounds}
                            positions={events.length ? events : positions}
                            route={route}
                            stop={stop}
                            zoom={zoom}
                            stopsBbox={this.stopsBbox}
                          />
                        )}
                      </QueryArea>
                    )}
                  </MapPanel>
                );
              }}
            </SingleStopQuery>
          )}
        </JourneyPosition>
      </AppFrame>
    );
  }
}

export default App;
