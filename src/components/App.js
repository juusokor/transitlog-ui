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
  static getDerivedStateFromProps({state}, {prevQueryDate, selectedVehicle}) {
    const queryDate = state.date;

    if (!selectedVehicle || !prevQueryDate) {
      return null;
    }

    if (queryDate !== prevQueryDate && !!selectedVehicle) {
      return {
        prevQueryDate: queryDate,
        selectedVehicle: null,
      };
    }

    return null;
  }

  constructor() {
    super();
    this.state = {
      prevQueryDate: "",
      stop: defaultStop,
      selectedVehicle: null,
      map: defaultMapPosition,
      bbox: null,
    };
  }

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
    const {map, playing, timeIncrement, stop, selectedVehicle} = this.state;

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
          line={line}
          route={route}
          stop={stop}
          isPlaying={playing}
          timeIncrement={timeIncrement}
          setTimeIncrement={this.setTimeIncrement}
          onClickPlay={this.toggleAutoplay}
          onDateSelected={onDateSelected}
          onChangeQueryTime={this.onChangeQueryTime}
          onLineSelected={onLineSelected}
          onRouteSelected={onRouteSelected}
          onStopSelected={this.onStopSelected}
        />
        <LeafletMap position={map} onMapChanged={this.onMapChanged}>
          {!route.routeId && map.zoom > 15 && <StopLayer bounds={this.state.bbox} />}
          <RouteQuery route={route}>
            {({routePositions, stops}) => (
              <RouteLayer
                route={route}
                routePositions={routePositions}
                stops={stops}
                setMapBounds={this.setMapBounds}
                mapBounds={map.bounds}
                key={`routes_${route.routeId}_${route.direction}_${stop.stopId}`}
                onChangeQueryTime={this.onChangeQueryTime}
                queryDate={date}
                queryTime={time}
                hfpPositions={hfpPositions}
                selectedStop={stop}
              />
            )}
          </RouteQuery>
          {hfpPositions.length > 0 &&
            hfpPositions.map((positionGroup) => (
              <React.Fragment
                key={`hfp_group_${positionGroup.groupName}_${route.routeId}_${
                  route.direction
                }`}>
                {get(selectedVehicle, "uniqueVehicleId", null) ===
                  positionGroup.groupName && (
                  <HfpLayer
                    key={`hfp_lines_${positionGroup.groupName}`}
                    selectedVehicle={selectedVehicle}
                    positions={positionGroup.positions}
                    name={positionGroup.groupName}
                  />
                )}
                <HfpMarkerLayer
                  onMarkerClick={this.selectVehicle}
                  selectedVehicle={selectedVehicle}
                  queryDate={date}
                  queryTime={time}
                  positions={positionGroup.positions}
                  name={positionGroup.groupName}
                />
              </React.Fragment>
            ))}
        </LeafletMap>
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
