import React, {Component} from "react";
import FilterBar from "./filterbar/FilterBar";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import invoke from "lodash/invoke";
import getJourneyId from "../helpers/getJourneyId";
import styled from "styled-components";
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./map/JourneyPosition";
import MapContent from "./map/MapContent";
import {latLng} from "leaflet";
import SingleStopQuery from "../queries/SingleStopQuery";
import {observable, action} from "mobx";

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

  onMapChanged = (map) => {
    const {route} = this.props.state;

    if (!route.routeId && map.getZoom() > 14) {
      this.setStopsBbox(map);
    }
  };

  setStopsBbox = action((map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    if (!bounds || !invoke(bounds, "isValid")) {
      return;
    }

    this.stopsBbox = {
      minLat: bounds.getSouth(),
      minLon: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLon: bounds.getEast(),
    };
  });

  onClickVehicleMarker = (journey) => {
    const {Journey, Filters, state} = this.props;

    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Filters.setVehicle(journey.unique_vehicle_id);
    } else {
      Filters.setVehicle("");
    }

    Journey.setSelectedJourney(journey);
  };

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
                  <MapPanel onMapChanged={this.onMapChanged} center={centerPosition}>
                    {({zoom, setMapBounds}) => (
                      <MapContent
                        setMapBounds={setMapBounds}
                        positions={positions}
                        route={route}
                        stop={stop}
                        zoom={zoom}
                        stopsBbox={this.stopsBbox}
                      />
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
