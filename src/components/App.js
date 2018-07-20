import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import RouteQuery from "../queries/RouteQuery";
import moment from "moment";
import RouteLayer from "./RouteLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import timer from "../helpers/timer";

const defaultStop = {
  stopId: "",
  shortId: "",
  lat: "",
  lon: "",
  nameFi: "",
  stopIndex: 0,
};

const defaultLine = {
  lineId: "1006T",
  dateBegin: "2017-08-14",
  dateEnd: "2050-12-31",
};

class App extends Component {
  autoplayTimerHandle = null;

  constructor() {
    super();
    this.state = {
      playing: false,
      queryTime: "12:30:00",
      stop: defaultStop,
      line: defaultLine,
    };
  }

  onChangeQueryTime = (queryTime) => {
    this.setState({queryTime, playing: false});
  };

  onLineSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({
      line: {
        lineId,
        dateBegin,
        dateEnd,
      },
      // Clear stop selection when line changes.
      stop: lineId !== this.state.line.lineId ? defaultStop : undefined,
    });
  };

  onStopSelected = (stop) => {
    this.setState({stop});
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
    const {playing, stop, line, queryTime} = this.state;

    const {
      route,
      queryDate,
      onRouteSelected,
      onDateSelected,
      hfpPositions,
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
          onLineSelected={this.onLineSelected}
          onRouteSelected={onRouteSelected}
          onStopSelected={this.onStopSelected}
        />
        <RouteQuery route={route}>
          {({routePositions, stops}) => {
            return (
              <LeafletMap>
                <RouteLayer
                  positions={routePositions}
                  stops={stops}
                  selectedStop={stop}
                />
                {hfpPositions.length > 0 &&
                  hfpPositions.map((positionGroup) => (
                    <HfpMarkerLayer
                      key={`hfp_group_${positionGroup.groupName}_${route.routeId}`}
                      queryDate={queryDate}
                      queryTime={queryTime}
                      positions={positionGroup.positions}
                      name={positionGroup.groupName}
                    />
                  ))}
              </LeafletMap>
            );
          }}
        </RouteQuery>
      </div>
    );
  }
}

export default App;
