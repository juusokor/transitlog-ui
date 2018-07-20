import React, {Component} from "react";
import "./App.css";
import {LeafletMap} from "./LeafletMap";
import {FilterPanel} from "./FilterPanel";
import RouteQuery from "../queries/RouteQuery";
import moment from "moment";

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
  constructor() {
    super();
    this.state = {
      queryTime: "12:30",
      stop: defaultStop,
      line: defaultLine,
    };
  }

  onChangeQueryTime = (queryTime) => {
    this.setState({queryTime});
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

  prevQueryTime = "";
  prevHfpPosition = null;

  hfpPositionAtTime = (queryTime) => {
    if (!queryTime || queryTime === this.prevQueryTime) {
      return this.prevHfpPosition;
    }

    const {hfpPositions, queryDate} = this.props;
    const queryTimeMoment = moment(`${queryDate}T${queryTime}`);

    const nextHfpPosition = hfpPositions.reduce((chosenPosition, position) => {
      const prevDifference = Math.abs(
        queryTimeMoment.diff(moment(chosenPosition.receivedAt), "seconds")
      );

      if (prevDifference < 5) {
        return chosenPosition;
      }

      if (
        Math.abs(queryTimeMoment.diff(moment(position.receivedAt), "seconds")) <
        prevDifference
      ) {
        return position;
      }

      return chosenPosition;
    }, hfpPositions[0]);

    this.prevHfpPosition = nextHfpPosition;
    return nextHfpPosition;
  };

  render() {
    const {stop, line, queryTime} = this.state;
    const {route, queryDate, onRouteSelected, onDateSelected} = this.props;

    let hfpPosition = this.hfpPositionAtTime(queryTime);

    return (
      <RouteQuery route={route} hfpPositions={hfpPosition}>
        {({routePositions, stops}) => {
          return (
            <div className="transitlog">
              <FilterPanel
                queryDate={queryDate}
                queryTime={queryTime}
                line={line}
                route={route}
                stop={stop}
                onDateSelected={onDateSelected}
                onChangeQueryTime={this.onChangeQueryTime}
                onLineSelected={this.onLineSelected}
                onRouteSelected={onRouteSelected}
                onStopSelected={this.onStopSelected}
              />
              <LeafletMap
                routePositions={routePositions}
                hfpPositions={[]}
                hfpPosition={hfpPosition}
                stops={stops}
                stop={stop}
                route={route}
              />
            </div>
          );
        }}
      </RouteQuery>
    );
  }
}

export default App;
