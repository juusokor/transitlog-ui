import React, {Component} from "react";
import get from "lodash/get";
import {LeafletMap} from "./map/LeafletMap";
import FilterPanel from "./filterpanel/FilterPanel";
import moment from "moment";
import RouteLayer from "./map/RouteLayer";
import StopLayer from "./map/StopLayer";
import HfpMarkerLayer from "./map/HfpMarkerLayer";
import timer from "../helpers/timer";
import LoadingOverlay from "./LoadingOverlay";
import HfpLayer from "./map/HfpLayer";
import "./App.css";
import "./Form.css";
import RouteQuery from "../queries/RouteQuery";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";

const defaultStop = {
  stopId: "",
  shortId: "",
  lat: "",
  lon: "",
  nameFi: "",
  stopIndex: 0,
};

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13, bounds: null};

@withHfpData
@inject(app("Filters", "Time"))
@observer
class App extends Component {
  constructor() {
    super();
    this.state = {
      stop: defaultStop,
      selectedVehicle: null,
      map: defaultMapPosition,
      bbox: null,
      queryVehicle: "",
    };
  }

  onChangeQueryVehicle = ({target}) => {
    this.setState({
      queryVehicle: target.value,
    });
  };

  onStopSelected = (stop) => {
    this.setState({
      stop,
      map: {
        ...this.state.map,
        zoom: !!stop ? 16 : 13,
        lat: get(stop, "lat", defaultMapPosition.lat),
        lng: get(stop, "lon", defaultMapPosition.lng),
      },
    });
  };

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

  selectVehicle = (vehiclePosition = null) => {
    this.setState({
      selectedVehicle: vehiclePosition,
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

  render() {
    const {
      map,
      playing,
      timeIncrement,
      stop,
      selectedVehicle,
      queryVehicle,
    } = this.state;

    const {
      route,
      line,
      onRouteSelected,
      onLineSelected,
      onDateSelected,
      hfpPositions,
      loading,
      Filters,
      Time,
      state,
    } = this.props;

    const {date, time} = state;
    const {setTime, setTimeIncrement, toggleAutoplay} = Time;
    const {setDate} = Filters;

    return (
      <div className="transitlog">
        <FilterPanel
          queryDate={date}
          queryTime={time}
          queryVehicle={queryVehicle}
          line={line}
          route={route}
          stop={stop}
          isPlaying={playing}
          timeIncrement={timeIncrement}
          setTimeIncrement={this.setTimeIncrement}
          onClickPlay={this.toggleAutoplay}
          onDateSelected={onDateSelected}
          onChangeQueryVehicle={this.onChangeQueryVehicle}
          onLineSelected={onLineSelected}
          onRouteSelected={onRouteSelected}
          onStopSelected={this.onStopSelected}
        />
        <LeafletMap position={map} onMapChanged={this.onMapChanged}>
          {!route.routeId &&
            map.zoom > 14 && (
              <StopLayer selectedStop={stop.stopId} bounds={this.state.bbox} />
            )}
          <RouteQuery route={route}>
            {({routePositions, stops}) => (
              <RouteLayer
                route={route}
                routePositions={routePositions}
                stops={stops}
                setMapBounds={this.setMapBounds}
                mapBounds={map.bounds}
                key={`routes_${route.routeId}_${route.direction}_${stop.stopId}`}
                queryDate={date}
                queryTime={time}
                hfpPositions={hfpPositions}
                selectedStop={stop}
              />
            )}
          </RouteQuery>
          {hfpPositions.length > 0 &&
            hfpPositions.map(({positions, groupName}) => {
              if (queryVehicle && groupName !== queryVehicle) {
                return null;
              }

              const key = `${groupName}_${route.routeId}_${route.direction}`;
              const lineVehicleId =
                queryVehicle || get(selectedVehicle, "uniqueVehicleId", "");

              const lineKey = `${route.routeId}_${
                route.direction
              }_${lineVehicleId}_${get(selectedVehicle, "journeyStartTime", "")}`;

              return (
                <React.Fragment key={`hfp_group_${key}`}>
                  {(queryVehicle || lineVehicleId === groupName) && (
                    <HfpLayer
                      key={`hfp_lines_${lineKey}`}
                      selectedVehicle={selectedVehicle}
                      positions={positions}
                      name={groupName}
                    />
                  )}
                  <HfpMarkerLayer
                    onMarkerClick={this.selectVehicle}
                    selectedVehicle={selectedVehicle}
                    queryDate={date}
                    queryTime={time}
                    positions={positions}
                    name={groupName}
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
