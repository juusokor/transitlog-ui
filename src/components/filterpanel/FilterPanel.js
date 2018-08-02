import React, {Component} from "react";
import "./FilterPanel.css";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import {RouteInput} from "./RouteInput";
import QueryRoutesByLine from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import Header from "./Header";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import VehicleQuery from "../../queries/VehicleQuery";

export class FilterPanel extends Component {
  state = {
    visible: true,
  };

  toggleVisibility = (e) => {
    e.preventDefault();

    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const {
      stop,
      route,
      line,
      queryDate,
      queryTime,
      isPlaying,
      queryVehicle,
      onChangeQueryVehicle,
      onChangeQueryTime,
      onDateSelected,
      onStopSelected,
      onRouteSelected,
      onClickPlay,
      timeIncrement,
      setTimeIncrement,
    } = this.props;

    const {visible} = this.state;

    return (
      <header
        className={`transitlog-header filter-panel ${visible ? "visible" : ""}`}>
        <Header />
        <DateSettings queryDate={queryDate} onDateSelected={onDateSelected} />
        <TimeSettings
          queryTime={queryTime}
          onClickPlay={onClickPlay}
          isPlaying={isPlaying}
          onChangeQueryTime={onChangeQueryTime}
          setTimeIncrement={setTimeIncrement}
          timeIncrement={timeIncrement}
        />
        <p>
          <input
            type="text"
            name="vehicle"
            value={queryVehicle}
            onChange={onChangeQueryVehicle}
          />
        </p>
        {!!route.routeId ? (
          <StopsByRouteQuery
            key="stop_input_by_route"
            variables={{
              routeId: route.routeId,
              direction: route.direction,
              dateBegin: route.dateBegin,
              dateEnd: route.dateEnd,
            }}>
            {({stops}) => (
              <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />
            )}
          </StopsByRouteQuery>
        ) : (
          <AllStopsQuery key="all_stops">
            {({stops}) => (
              <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />
            )}
          </AllStopsQuery>
        )}
        <AllLinesQuery queryDate={queryDate}>
          {({lines}) => (
            <LineInput
              line={this.props.line}
              onSelect={this.props.onLineSelected}
              lines={lines}
            />
          )}
        </AllLinesQuery>
        {line.lineId && (
          <QueryRoutesByLine variables={line}>
            {({routes}) => (
              <RouteInput
                route={route}
                onRouteSelected={onRouteSelected}
                routes={routes}
              />
            )}
          </QueryRoutesByLine>
        )}
        <button className="toggle-filter-panel" onClick={this.toggleVisibility}>
          {visible ? "<" : ">"}
        </button>
      </header>
    );
  }
}
