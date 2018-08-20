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

@inject(app("UI"))
@withHfpData
@observer
class App extends Component {
  state = {
    map: defaultMapPosition,
    bbox: null,
  };

  onMapChanged = ({target}) => {
    const bounds = target.getBounds();
    const zoom = target.getZoom();

    if (!bounds || !bounds.isValid()) {
      return;
    }

    this.setState({
      map: {...get(this, "state.map", defaultMapPosition), zoom},
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
          ...get(this, "state.map", defaultMapPosition),
          bounds,
        },
      });
    }
  };

  render() {
    const {map} = this.state;
    const {hfpPositions, loading, state, UI} = this.props;

    const {route, vehicle, stop, selectedVehicle} = state;

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

              const lineVehicleId = get(selectedVehicle, "uniqueVehicleId", "");
              const journeyStartTime = get(selectedVehicle, "journeyStartTime", "");
              const journeyDesc = get(selectedVehicle, "jrn", "");

              console.log(journeyDesc);

              const key = `${lineVehicleId}_${route}_${journeyStartTime}`;

              return [
                lineVehicleId === vehicleId ? (
                  <HfpLayer
                    key={`hfp_line_${key}`}
                    selectedVehicle={selectedVehicle}
                    positions={positions}
                    name={vehicleId}
                  />
                ) : null,
                <HfpMarkerLayer
                  key={`hfp_markers_${route}_${vehicleId}`}
                  onMarkerClick={UI.setSelectedVehicle}
                  selectedVehicle={selectedVehicle}
                  positions={positions}
                  name={vehicleId}
                />,
              ];
            })}
        </LeafletMap>
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
