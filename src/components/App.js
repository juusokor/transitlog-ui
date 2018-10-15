import React, {Component} from "react";
import get from "lodash/get";
import FilterBar from "./filterbar/FilterBar";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import StopLayer from "./map/StopLayer";
import RouteQuery from "../queries/RouteQuery";
import RouteLayer from "./map/RouteLayer";
import HfpLayer from "./map/HfpLayer";
import HfpMarkerLayer from "./map/HfpMarkerLayer";
import invoke from "lodash/invoke";
import getJourneyId from "../helpers/getJourneyId";
import withRoute from "../hoc/withRoute";
import createRouteIdentifier from "../helpers/createRouteIdentifier";
import styled from "styled-components";
import SidePanel from "./SidePanel";
import {ModalProvider} from "styled-react-modal";
import getCoarsePositionForTime from "../helpers/getCoarsePositionForTime";
import {latLng} from "leaflet";
import withStop from "../hoc/withStop";

const AppFrame = styled.main`
  height: 100%;
  overflow: hidden;
  display: grid;
  grid-template-columns: 20rem 1fr;
  grid-template-rows: 9rem 1fr;
`;

const MapPanel = styled(Map)`
  top: 9rem;
  left: 20rem;
  width: calc(100% - 20rem);
  height: calc(100% - 9rem);
`;

let prevJourneyKey = "";
let prevTime = "";
let followSelectedJourney = false;

@inject(app("Journey", "Filters"))
@withHfpData
@withRoute
@withStop
@observer
class App extends Component {
  state = {
    stopsBbox: null,
  };

  onMapChanged = (map) => {
    const {route} = this.props.state;

    if (!route.routeId && map.getZoom() > 14) {
      this.setStopsBbox(map);
    }
  };

  setStopsBbox = (map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    if (!bounds || !invoke(bounds, "isValid")) {
      return;
    }

    this.setState({
      stopsBbox: {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      },
    });
  };

  getJourneyPosition = () => {
    const {
      state: {selectedJourney, date, time},
      positions = [],
    } = this.props;

    let journeyPosition = null;

    if (selectedJourney) {
      const journeyId = getJourneyId(selectedJourney);
      const timeDate = new Date(`${date}T${time}`);

      const journeyPositions = get(
        positions.find((j) => j.journeyId === journeyId),
        "positions",
        []
      );

      const pos = getCoarsePositionForTime(journeyPositions, timeDate, journeyId);

      if (pos) {
        journeyPosition = latLng([pos.lat, pos.long]);
      }
    }

    return journeyPosition;
  };

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
    const {stopsBbox} = this.state;
    const {state, positions = [], loading} = this.props;
    const {route, vehicle, stop, selectedJourney, time} = state;

    let journeyPosition;
    const selectedJourneyId = getJourneyId(selectedJourney);

    /*
    The idea here is to make the map center follow the HFP marker ONLY IF
    the current journey hasn't changed. These conditionals need to be
    in this exact order for this to work, otherwise the map may
    recenter when changing journeys.
     */

    // 1. Change the journey key when the selected journey changes.
    if (
      !prevJourneyKey ||
      (selectedJourneyId && prevJourneyKey !== selectedJourneyId)
    ) {
      prevJourneyKey = selectedJourneyId;
      followSelectedJourney = false;
      prevTime = time;
    } else if (!selectedJourney) {
      prevJourneyKey = "";
    }

    // 2. Allow following the selected journey if the journey ID is the same
    // BUT the time has changed.
    if (
      !!prevJourneyKey &&
      prevJourneyKey === selectedJourneyId &&
      prevTime !== time
    ) {
      followSelectedJourney = true;
    }

    // 3. If following is allowed, do that.
    if (followSelectedJourney) {
      journeyPosition = this.getJourneyPosition();
      prevTime = time;
    }

    return (
      <ModalProvider>
        <AppFrame>
          <FilterBar />
          <SidePanel loading={loading} />
          <MapPanel onMapChanged={this.onMapChanged} center={journeyPosition}>
            {({lat, lng, zoom, setMapBounds}) => (
              <React.Fragment>
                {!route.routeId &&
                  zoom > 14 && <StopLayer selectedStop={stop} bounds={stopsBbox} />}
                <RouteQuery
                  key={`route_query_${createRouteIdentifier(route)}`}
                  route={route}>
                  {({routeGeometry, stops}) =>
                    routeGeometry.length !== 0 ? (
                      <RouteLayer
                        routeGeometry={routeGeometry}
                        stops={stops}
                        setMapBounds={setMapBounds}
                        key={`route_line_${route.routeId}`}
                        positions={positions}
                      />
                    ) : null
                  }
                </RouteQuery>
                {positions.length > 0 &&
                  positions.map(({positions, journeyId}) => {
                    if (
                      vehicle &&
                      get(positions, "[0].unique_vehicle_id", "") !== vehicle
                    ) {
                      return null;
                    }

                    const isSelectedJourney =
                      selectedJourney && getJourneyId(selectedJourney) === journeyId;

                    return [
                      isSelectedJourney ? (
                        <HfpLayer
                          key={`hfp_line_${journeyId}`}
                          selectedJourney={selectedJourney}
                          positions={positions}
                          name={journeyId}
                        />
                      ) : null,
                      <HfpMarkerLayer
                        key={`hfp_markers_${journeyId}`}
                        onMarkerClick={this.onClickVehicleMarker}
                        positions={positions}
                        name={journeyId}
                      />,
                    ];
                  })}
              </React.Fragment>
            )}
          </MapPanel>
        </AppFrame>
      </ModalProvider>
    );
  }
}

export default App;
