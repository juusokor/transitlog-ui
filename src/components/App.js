import React, {Component} from "react";
import get from "lodash/get";
import invoke from "lodash/invoke";
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
import propify from "../hoc/propify";

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13, bounds: null};

@inject(app("Journey"))
@withHfpData
@propify("time") // Make time from state into a React prop
@observer
class App extends Component {
  state = {
    following: null,
    prevFollowingTime: "",
    map: defaultMapPosition,
    bbox: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      state: {selectedJourney, date},
      time,
      positionsByJourney,
    } = nextProps;

    if (!selectedJourney) {
      return prevState.following !== null
        ? {
            following: null,
            prevFollowingTime: "",
          }
        : null;
    }

    const journeyStartTime = get(selectedJourney, "journeyStartTime");
    const uniqueVehicleId = get(selectedJourney, "uniqueVehicleId");

    const followingStartTime = get(prevState, "following.journeyStartTime");
    const followingVehicleId = get(prevState, "following.uniqueVehicleId");
    const followingLat = get(prevState, "following.lat");
    const followingLong = get(prevState, "following.long");
    const prevFollowingTime = get(prevState, "prevFollowingTime", "");

    if (
      journeyStartTime !== followingStartTime ||
      uniqueVehicleId !== followingVehicleId ||
      time !== prevFollowingTime
    ) {
      let journeyPositions = get(
        positionsByJourney.find((j) => j.journeyStartTime === journeyStartTime),
        "positions",
        []
      );

      if (journeyPositions.length === 0) {
        return null;
      }

      let followPosition = null;
      const timeDate = new Date(`${date}T${time}`);

      for (const pos of journeyPositions) {
        if (Math.abs(diffDates(new Date(pos.receivedAt), timeDate)) < 30) {
          followPosition = pos;
          break;
        }
      }

      if (
        !followPosition ||
        (followPosition.lat === followingLat &&
          followPosition.long === followingLong)
      ) {
        return null;
      }

      return {
        prevFollowingTime: time,
        following: followPosition,
      };
    }

    return null;
  }

  updateMapState = (map, {center, zoom}) => {
    this.setState({
      map: {
        ...this.state.map,
        lat: center[0],
        lng: center[1],
        zoom,
      },
    });
  };

  onMapChanged = (map) => {
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

  setMapBounds = (bounds = null) => {
    if (!bounds || !invoke(bounds, "isValid")) {
      return;
    }

    this.setState({
      map: {
        ...get(this, "state.map", defaultMapPosition),
        bounds,
      },
    });
  };

  render() {
    const {map, following} = this.state;
    const {positionsByVehicle, loading, state, Journey} = this.props;

    const {route, vehicle, stop, selectedJourney} = state;

    const followingLat = get(following, "lat", null);
    const followingLng = get(following, "long", null);

    const position = {
      ...map,
      lat: followingLat ? followingLat : map.lat,
      lng: followingLng ? followingLng : map.lng,
      zoom: followingLat ? 16 : map.zoom,
    };

    return (
      <div className="transitlog">
        <FilterPanel />
        <LeafletMap
          position={position}
          onMapChanged={this.onMapChanged}
          onMapChange={this.updateMapState}>
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
