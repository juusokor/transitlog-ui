import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import StopLayer from "./StopLayer";
import RouteQuery from "../../queries/RouteQuery";
import RouteLayer from "./RouteLayer";
import get from "lodash/get";
import HfpLayer from "./HfpLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import {LeafletMap} from "./LeafletMap";
import withHfpData from "../../hoc/withHfpData";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import map from "lodash/map";

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13};

@inject(app("Journey"))
@withHfpData
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
  };

  state = {
    bbox: null,
    ...defaultMapPosition,
  };

  onMapChanged = (map, viewport) => {
    this.getBbox(map);
    this.props.onMapChanged(map, viewport);
  };

  onMapChange = (map, viewport) => {
    this.setState({
      lat: viewport.center[0],
      lng: viewport.center[1],
      zoom: viewport.zoom,
    });

    this.props.onMapChange(map, viewport);
  };

  getBbox = (map) => {
    const bounds = map.getBounds();

    if (!bounds || !invoke(bounds, "isValid")) {
      return;
    }

    this.setState({
      bbox: {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      },
    });
  };

  render() {
    const {positionsByVehicle, state, Journey, bounds, setMapBounds} = this.props;
    const {bbox, lat, lng, zoom} = this.state;
    const {route, vehicle, stop, selectedJourney} = state;

    return (
      <LeafletMap
        center={[lat, lng]}
        zoom={zoom}
        bounds={bounds}
        onMapChanged={this.onMapChanged}
        onMapChange={this.onMapChange}>
        {!route && map.zoom > 14 && <StopLayer selectedStop={stop} bounds={bbox} />}
        <RouteQuery route={route}>
          {({routePositions, stops}) => (
            <RouteLayer
              route={route}
              routePositions={routePositions}
              stops={stops}
              setMapBounds={setMapBounds}
              mapBounds={map.bounds}
              key={`route_line_${route}`}
              hfpPositions={positionsByVehicle}
            />
          )}
        </RouteQuery>
        {positionsByVehicle.length > 0 &&
          positionsByVehicle.map(({positions, vehicleId}) => {
            if (vehicle && vehicleId !== vehicle) {
              return null;
            }

            const lineVehicleId = get(selectedJourney, "uniqueVehicleId", "");
            const journeyStartTime = get(selectedJourney, "journeyStartTime", "");

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
                onMarkerClick={Journey.setSelectedJourney}
                selectedJourney={selectedJourney}
                positions={positions}
                name={vehicleId}
              />,
            ];
          })}
      </LeafletMap>
    );
  }
}

export default Map;
