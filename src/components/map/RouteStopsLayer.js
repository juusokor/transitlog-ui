import React, {Component} from "react";
import RouteStopMarker from "./RouteStopMarker";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import DeparturesQuery from "../../queries/DeparturesQuery";
import get from "lodash/get";
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

  getStopMarker = (
    stop,
    isSelected,
    isFirst,
    isLast,
    departures = [],
    positions = []
  ) => {
    const {
      route,
      state: {date, selectedJourney},
      onViewLocation,
    } = this.props;

    return (
      <RouteStopMarker
        key={`stop_marker_${stop.stopId}`}
        selected={isSelected}
        firstTerminal={isFirst}
        lastTerminal={isLast}
        departures={departures}
        positions={positions}
        selectedJourney={selectedJourney}
        stop={stop}
        date={date}
        onViewLocation={onViewLocation}
        routeOriginStopId={get(route, "originstopId", "")}
        onSelect={this.onSelectStop(stop.stopId)}
      />
    );
  };

  renderStops = (stops, departures = []) => {
    const {state, positions = []} = this.props;
    const {stop: selectedStop, selectedJourney} = state;

    return stops.map((stop, index) => {
      const isSelected = stop.stopId === selectedStop;

      // Funnily enough, the first stop is last in the array.
      const isFirst = index === stops.length - 1;
      // ...and the last stop is first.
      const isLast = index === 0;

      if (departures.length === 0 || !selectedJourney) {
        return this.getStopMarker(stop, isSelected, isFirst, isLast);
      }

      return this.getStopMarker(
        stop,
        isSelected,
        isFirst,
        isLast,
        departures,
        positions
      );
    });
  };

  render() {
    const {state, route} = this.props;
    const {selectedJourney} = state;

    return (
      <StopsByRouteQuery route={route}>
        {({stops}) => {
          if (!selectedJourney) {
            return this.renderStops(stops, []);
          }

          const {route_id, direction_id, oday} = selectedJourney;

          return (
            <DeparturesQuery
              date={oday}
              route={{
                routeId: route_id,
                direction: direction_id,
              }}>
              {({departures}) => this.renderStops(stops, departures)}
            </DeparturesQuery>
          );
        }}
      </StopsByRouteQuery>
    );
  }
}

export default RouteStopsLayer;
