import React, {Component} from "react";
import RouteStopMarker from "./RouteStopMarker";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";

@inject(app("Filters"))
@observer
class RouteStopsLayer extends Component {
  onSelectStop = (stopId = null) => () => {
    const {stop} = this.props.state;

    if (stopId !== null && stop !== stopId) {
      this.props.Filters.setStop(stopId);
    }
  };

  getStopMarker = (stop, isFirst, isLast) => {
    const {
      state: {date, stop: selectedStop, selectedJourney},
      onViewLocation,
      showRadius,
      positions = [],
    } = this.props;

    const isSelected = stop.stopId === selectedStop;

    return (
      <RouteStopMarker
        key={`stop_marker_${stop.stopId}`}
        selected={isSelected}
        firstTerminal={isFirst}
        lastTerminal={isLast}
        positions={positions}
        selectedJourney={selectedJourney}
        stop={stop}
        date={date}
        onViewLocation={onViewLocation}
        onSelect={this.onSelectStop(stop.stopId)}
        showRadius={showRadius}
      />
    );
  };

  renderStops = (stops) => {
    return stops.map((stop, index) => {
      // Funnily enough, the first stop is last in the array.
      const isFirst = index === stops.length - 1;
      // ...and the last stop is first.
      const isLast = index === 0;

      return this.getStopMarker(stop, isFirst, isLast);
    });
  };

  render() {
    const {route} = this.props;

    return (
      <StopsByRouteQuery route={route}>
        {({stops}) => this.renderStops(stops)}
      </StopsByRouteQuery>
    );
  }
}

export default RouteStopsLayer;
