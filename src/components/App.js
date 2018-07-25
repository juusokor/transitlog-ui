import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import RouteQuery from "../queries/RouteQuery";
import moment from "moment";
import RouteLayer from "./RouteLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import timer from "../helpers/timer";
import LoadingOverlay from "./LoadingOverlay";
import HfpLayer from "./HfpLayer";

const defaultStop = {
  stopId: "",
  shortId: "",
  lat: "",
  lon: "",
  nameFi: "",
  stopIndex: 0,
};

class App extends Component {
  autoplayTimerHandle = null;

  constructor() {
    super();
    this.state = {
      playing: false,
      queryTime: "12:30:00",
      stop: defaultStop,
      selectedVehicle: "",
    };
  }

  onChangeQueryTime = (queryTime) => {
    this.setState({queryTime});
  };

  onStopSelected = (stop) => {
    this.setState({stop});
  };

  selectVehicle = (vehicleId = "") => {
    this.setState({
      selectedVehicle: vehicleId,
    });
  };

  toggleAutoplay = (e) => {
    this.setState({playing: !this.state.playing});
  };

  autoplay = () => {
    const nextQueryTime = moment(this.state.queryTime, "HH:mm:ss")
      .add(10, "seconds")
      .format("HH:mm:ss");

    this.setState({
      queryTime: nextQueryTime,
    });
  };

  componentDidUpdate() {
    if (this.state.playing && !this.autoplayTimerHandle) {
      this.autoplayTimerHandle = timer(() => this.autoplay(), 1000);
    } else if (!this.state.playing && !!this.autoplayTimerHandle) {
      cancelAnimationFrame(this.autoplayTimerHandle.value);
      this.autoplayTimerHandle = null;
    }
  }

  render() {
    const {playing, stop, queryTime, selectedVehicle} = this.state;

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
          line={line}
          route={route}
          stop={stop}
          isPlaying={playing}
          onClickPlay={this.toggleAutoplay}
          onDateSelected={onDateSelected}
          onChangeQueryTime={this.onChangeQueryTime}
          onLineSelected={onLineSelected}
          onRouteSelected={onRouteSelected}
          onStopSelected={this.onStopSelected}
        />
        <LeafletMap>
          <RouteQuery route={route}>
            {({routePositions, stops}) => (
              <RouteLayer
                key={`routes_${route.routeId}_${route.direction}_${stop.stopId}`}
                onChangeQueryTime={this.onChangeQueryTime}
                queryDate={queryDate}
                queryTime={queryTime}
                hfpPositions={hfpPositions}
                positions={routePositions}
                stops={stops}
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
                {selectedVehicle === positionGroup.groupName && (
                  <HfpLayer
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
            ))}
        </LeafletMap>
        {loading && <LoadingOverlay message="Ladataan HFP tietoja..." />}
      </div>
    );
  }
}

export default App;
