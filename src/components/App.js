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
import SidePanel from "./sidepanel/SidePanel";
import JourneyPosition from "./map/JourneyPosition";
import StopPosition from "./map/StopPosition";
import StopMarker from "./map/StopMarker";

const DEFAULT_SIDEPANEL_WIDTH = 25;

const AppFrame = styled.main`
  display: grid;
  grid-template-columns: ${({sidepanelWidth}) => sidepanelWidth}rem 1fr;
  grid-template-rows: 9rem 1fr;
  justify-content: stretch;
  transition: all 0.15s ease-out;
  overflow: hidden;
  height: 100%;
`;

const MapPanel = styled(Map)`
  top: 9rem;
  left: ${({sidepanelWidth}) => sidepanelWidth}rem;
  width: calc(100% - ${({sidepanelWidth}) => sidepanelWidth}rem);
  height: calc(100% - 9rem);
`;

@inject(app("Journey", "Filters"))
@withHfpData
@withRoute
@observer
class App extends Component {
  state = {
    stopsBbox: null,
    sidepanelWidthRem: DEFAULT_SIDEPANEL_WIDTH,
  };

  setSidepanelWidth = (width = DEFAULT_SIDEPANEL_WIDTH) => {
    this.setState({
      sidepanelWidthRem: width,
    });
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
    const {stopsBbox, sidepanelWidthRem} = this.state;
    const {state, positions = [], loading} = this.props;
    const {route, vehicle, selectedJourney, date} = state;

    return (
      <AppFrame sidepanelWidth={sidepanelWidthRem}>
        <FilterBar />
        <SidePanel loading={loading} positions={positions} />
        <JourneyPosition positions={positions}>
          {(journeyPosition) => (
            <StopPosition>
              {(stopPosition, stop) => {
                const centerPosition = stopPosition ? stopPosition : journeyPosition;

                return (
                  <MapPanel
                    sidepanelWidth={sidepanelWidthRem}
                    onMapChanged={this.onMapChanged}
                    center={centerPosition}>
                    {({lat, lng, zoom, setMapBounds}) => (
                      <React.Fragment>
                        {!route.routeId && zoom > 14 ? (
                          <StopLayer date={date} bounds={stopsBbox} />
                        ) : stopPosition ? (
                          <StopMarker stop={stop} selected={true} date={date} />
                        ) : null}
                        {route &&
                          route.routeId && (
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
                          )}
                        {positions.length > 0 &&
                          positions.map(({positions, journeyId}) => {
                            if (
                              vehicle &&
                              get(positions, "[0].unique_vehicle_id", "") !== vehicle
                            ) {
                              return null;
                            }

                            const isSelectedJourney =
                              selectedJourney &&
                              getJourneyId(selectedJourney) === journeyId;

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
                );
              }}
            </StopPosition>
          )}
        </JourneyPosition>
      </AppFrame>
    );
  }
}

export default App;
