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
import diffDates from "../helpers/diffDates";

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13, bounds: null};

@inject(app("Journey"))
@withHfpData
@observer
class App extends Component {
  state = {
    following: null,
    map: defaultMapPosition,
    bbox: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      state: {selectedJourney, time, date},
      positionsByJourney,
    } = nextProps;

    if (!selectedJourney) {
      return null;
    }

    const journeyStartTime = get(selectedJourney, "journeyStartTime");
    const uniqueVehicleId = get(selectedJourney, "uniqueVehicleId");

    const followingStartTime = get(prevState, "following.journeyStartTime");
    const followingVehicleId = get(prevState, "following.uniqueVehicleId");

    if (
      journeyStartTime !== followingStartTime ||
      uniqueVehicleId !== followingVehicleId
    ) {
      const timeDate = new Date(`${date}T${time}`);
      let followPosition = null;

      let journeyPositions = get(
        positionsByJourney.find((j) => j.journeyStartTime === journeyStartTime),
        "positions",
        []
      );

      console.log(positionsByJourney);

      if (journeyPositions.length === 0) {
        return null;
      }

      for (const posIndex of journeyPositions) {
        const pos = journeyPositions[posIndex];
        if (Math.abs(diffDates(new Date(pos.receivedAt), timeDate)) < 60) {
          followPosition = pos;
          break;
        }
      }

      console.log(followPosition);

      return followPosition
        ? {
            following: followPosition,
            map: {
              bounds: null,
              lat: followPosition.lat,
              lng: followPosition.long,
              zoom: 16,
            },
          }
        : null;
    }

    return null;
  }

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
    const {positionsByVehicle, loading, state, Journey} = this.props;

    const {route, vehicle, stop, selectedJourney} = state;

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
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
