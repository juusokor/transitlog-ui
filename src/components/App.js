import React, {Component} from "react";
import get from "lodash/get";
import {LeafletMap} from "./map/LeafletMap";
import {FilterPanel} from "./filterpanel/FilterPanel";
import moment from "moment";
import RouteLayer from "./map/RouteLayer";
import StopLayer from "./map/StopLayer";
import HfpMarkerLayer from "./map/HfpMarkerLayer";
import timer from "../helpers/timer";
import LoadingOverlay from "./LoadingOverlay";
import HfpLayer from "./map/HfpLayer";
import "./App.css";
import "./Form.css";

const defaultStop = {
  stopId: "",
  shortId: "",
  lat: "",
  lon: "",
  nameFi: "",
  stopIndex: 0,
};

const defaultMapPosition = {lat: 60.170988, lng: 24.940842, zoom: 13, bounds: null};

class App extends Component {
  autoplayTimerHandle = null;

  static getDerivedStateFromProps({queryDate}, {prevQueryDate, selectedVehicle}) {
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
      playing: false,
      queryTime: "12:30:00",
      stop: defaultStop,
      selectedVehicle: "",
      map: defaultMapPosition,
      bbox: null,
      timeIncrement: 5,
      queryVehicle: "",
    };
  }

  onChangeQueryVehicle = ({target}) => {
    this.setState({
      queryVehicle: target.value,
    });
  };

  onChangeQueryTime = (queryTime) => {
    this.setState({queryTime});
  };

  onStopSelected = (stop) => {
    this.setState({
      stop,
      map: {
        zoom: !!stop ? 16 : 13,
        lat: get(stop, "lat", defaultMapPosition.lat),
        lng: get(stop, "lon", defaultMapPosition.lng),
      },
    });
  };

  onMapChanged = ({target}) => {
    const bounds = target.getBounds();
    const zoom = target.getZoom();

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

  selectVehicle = (uniqueVehicleId) => {
    this.setState({
      selectedVehicle: uniqueVehicleId,
    });
  };

  toggleAutoplay = (e) => {
    this.setState({playing: !this.state.playing});
  };

  setTimeIncrement = ({target}) => {
    this.setState({
      timeIncrement: target.value,
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

  autoplay = () => {
    const nextQueryTime = moment(this.state.queryTime, "HH:mm:ss")
      .add(this.state.timeIncrement, "seconds")
      .format("HH:mm:ss");

    this.setState({
      queryTime: nextQueryTime,
    });
  };

  componentDidUpdate() {
    if (this.state.playing && !this.autoplayTimerHandle) {
      // timer() is a setInterval alternative that uses requestAnimationFrame.
      // This makes it more performant and can "pause" when the tab is not focused.
      this.autoplayTimerHandle = timer(() => this.autoplay(), 1000);
    } else if (!this.state.playing && !!this.autoplayTimerHandle) {
      cancelAnimationFrame(this.autoplayTimerHandle.value);
      this.autoplayTimerHandle = null;
    }
  }

  render() {
    const {
      map,
      playing,
      timeIncrement,
      stop,
      queryTime,
      selectedVehicle,
      queryVehicle,
    } = this.state;

    const {
      route,
      line,
      queryDate,
      onRouteSelected,
      onLineSelected,
      onDateSelected,
      hfpPositions,
      loading,
    } = this.props;

    return (
      <div className="transitlog">
        <FilterPanel
          queryDate={queryDate}
          queryTime={queryTime}
          queryVehicle={queryVehicle}
          line={line}
          route={route}
          stop={stop}
          isPlaying={playing}
          timeIncrement={timeIncrement}
          setTimeIncrement={this.setTimeIncrement}
          onClickPlay={this.toggleAutoplay}
          onDateSelected={onDateSelected}
          onChangeQueryTime={this.onChangeQueryTime}
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
          <RouteLayer
            route={route}
            setMapBounds={this.setMapBounds}
            mapBounds={map.bounds}
            key={`routes_${route.routeId}_${route.direction}_${stop.stopId}`}
            onChangeQueryTime={this.onChangeQueryTime}
            queryDate={queryDate}
            queryTime={queryTime}
            hfpPositions={hfpPositions}
            selectedStop={stop}
          />
          {hfpPositions.length > 0 &&
            hfpPositions.map((positionGroup) => {
              if (queryVehicle && positionGroup.groupName !== queryVehicle) {
                return null;
              }

              return (
                <React.Fragment
                  key={`hfp_group_${positionGroup.groupName}_${route.routeId}_${
                    route.direction
                  }`}>
                  {(queryVehicle || selectedVehicle === positionGroup.groupName) && (
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
                    queryDate={queryDate}
                    queryTime={queryTime}
                    positions={positionGroup.positions}
                    name={positionGroup.groupName}
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
