import React, {Component} from "react";
import get from "lodash/get";
import FilterPanel from "./filterpanel/FilterPanel";
import LoadingOverlay from "./LoadingOverlay";
import "./App.css";
import "./Form.css";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import {latLng} from "leaflet";
import getCoarsePositionForTime from "../helpers/getCoarsePositionForTime";
import StopLayer from "./map/StopLayer";
import RouteQuery from "../queries/RouteQuery";
import RouteLayer from "./map/RouteLayer";
import HfpLayer from "./map/HfpLayer";
import HfpMarkerLayer from "./map/HfpMarkerLayer";
import invoke from "lodash/invoke";
import getJourneyId from "../helpers/getJourneyId";

@inject(app("Journey", "Filters"))
@withHfpData
@observer
class App extends Component {
  state = {
    stopsBbox: null,
  };

  onMapChanged = (map) => {
    this.setStopsBbox(map);
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

  getJourneyBounds = () => {
    const {
      state: {selectedJourney, date, time},
      positionsByJourney,
    } = this.props;

    let journeyBounds = null;

    if (selectedJourney) {
      const journeyStartTime = get(selectedJourney, "journeyStartTime");
      const timeDate = new Date(`${date}T${time}`);

      const pos = getCoarsePositionForTime(
        positionsByJourney,
        journeyStartTime,
        timeDate
      );

      if (pos) {
        journeyBounds = latLng([pos.lat, pos.long]).toBounds(1000);
      }
    }

    return journeyBounds;
  };

  onClickVehicleMarker = (journey) => {
    const {Journey, Filters, state} = this.props;

    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Filters.setVehicle(journey.uniqueVehicleId);
    } else {
      Filters.setVehicle("");
    }

    Journey.setSelectedJourney(journey);
  };

  render() {
    const {stopsBbox} = this.state;
    const {loading, state, positionsByVehicle, positionsByJourney} = this.props;
    const {route, vehicle, stop, selectedJourney} = state;

    const journeyBounds = this.getJourneyBounds();

    return (
      <div className="transitlog">
        <FilterPanel />
        <Map onMapChanged={this.onMapChanged} bounds={journeyBounds}>
          {(lat, lng, zoom) => (
            <React.Fragment>
              {!route &&
                zoom > 14 && <StopLayer selectedStop={stop} bounds={stopsBbox} />}
              <RouteQuery route={route}>
                {({routePositions, stops}) => (
                  <RouteLayer
                    route={route}
                    routePositions={routePositions}
                    stops={stops}
                    setMapBounds={this.setMapBounds}
                    key={`route_line_${route}`}
                    positionsByVehicle={positionsByVehicle}
                    positionsByJourney={positionsByJourney}
                  />
                )}
              </RouteQuery>
              {positionsByVehicle.length > 0 &&
                positionsByVehicle.map(({positions, vehicleId}) => {
                  if (vehicle && vehicleId !== vehicle) {
                    return null;
                  }

                  const lineVehicleId = get(selectedJourney, "uniqueVehicleId", "");
                  const journeyStartTime = get(
                    selectedJourney,
                    "journeyStartTime",
                    ""
                  );

                  const key = `${lineVehicleId}_${route}_${journeyStartTime}`;

                  return [
                    lineVehicleId === vehicleId ? (
                      <HfpLayer
                        key={`hfp_line_${key}`}
                        selectedJourney={selectedJourney}
                        positions={positions}
                        name={vehicleId}
                      />
                    ) : null,
                    <HfpMarkerLayer
                      key={`hfp_markers_${route}_${vehicleId}`}
                      onMarkerClick={this.onClickVehicleMarker}
                      positions={positions}
                      name={vehicleId}
                    />,
                  ];
                })}
            </React.Fragment>
          )}
        </Map>
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
