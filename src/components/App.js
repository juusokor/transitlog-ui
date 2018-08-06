import React, {Component} from "react";
import get from "lodash/get";
import {LeafletMap} from "./map/LeafletMap";
import FilterPanel from "./filterpanel/FilterPanel";
import RouteLayer from "./map/RouteLayer";
import StopLayer from "./map/StopLayer";
import HfpMarkerLayer from "./map/HfpMarkerLayer";
import LoadingOverlay from "./LoadingOverlay";
import HfpLayer from "./map/HfpLayer";
import "./App.css";
import "./Form.css";
import RouteQuery from "../queries/RouteQuery";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13, bounds: null};

@inject(app("state"))
@withHfpData
@observer
class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedVehicle: null,
      map: defaultMapPosition,
      bbox: null,
    };
  }

  onMapChanged = ({target}) => {
    const bounds = target.getBounds();
    const zoom = target.getZoom();

    if (!bounds.isValid()) {
      return;
    }

    this.setState({
      map: {...this.state.map, zoom},
      bbox: {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      },
    });
  };

  setMapBounds = (bounds = null) => {
    if (bounds) {
      this.setState({
        map: {
          ...this.state.map,
          bounds,
        },
      });
    }
  };

  selectVehicle = (vehiclePosition = null) => {
    this.setState({
      selectedVehicle: vehiclePosition,
    });
  };

  render() {
    const {map, selectedVehicle} = this.state;
    const {hfpPositions, loading, state} = this.props;

    const {route, vehicle, stop} = state;

    return (
      <div className="transitlog">
        <FilterPanel />
        <LeafletMap position={map} onMapChanged={this.onMapChanged}>
          {!route &&
            map.zoom > 14 && (
              <StopLayer selectedStop={stop} bounds={this.state.bbox} />
            )}
          <RouteQuery route={route}>
            {({routePositions, stops}) => (
              <RouteLayer
                route={route}
                routePositions={routePositions}
                stops={stops}
                setMapBounds={this.setMapBounds}
                mapBounds={map.bounds}
                key={`route_line_${route}`}
                hfpPositions={hfpPositions}
              />
            )}
          </RouteQuery>
          {hfpPositions.length > 0 &&
            hfpPositions.map(({positions, vehicleId}) => {
              if (vehicle && vehicleId !== vehicle) {
                return null;
              }

              const key = `${vehicleId}_${route}`;

              const lineVehicleId =
                vehicle || get(selectedVehicle, "uniqueVehicleId", "");

              const lineKey = `${route}_${lineVehicleId}_${get(
                selectedVehicle,
                "journeyStartTime",
                ""
              )}`;

              return (
                <React.Fragment key={`hfp_group_${key}`}>
                  {(vehicle || lineVehicleId === vehicleId) && (
                    <HfpLayer
                      key={`hfp_lines_${lineKey}`}
                      selectedVehicle={selectedVehicle}
                      positions={positions}
                      name={vehicleId}
                    />
                  )}
                  <HfpMarkerLayer
                    onMarkerClick={this.selectVehicle}
                    selectedVehicle={selectedVehicle}
                    positions={positions}
                    name={vehicleId}
                  />
                </React.Fragment>
              );
            })}
        </LeafletMap>
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
