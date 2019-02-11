import React from "react";
import flow from "lodash/flow";
import RouteStopMarker from "./RouteStopMarker";
import {observer} from "mobx-react-lite";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("state")
);

function RouteStopsLayer({
  state: {date, stop: selectedStop, selectedJourney},
  route,
  onViewLocation,
  showRadius,
  journeyStops = [],
}) {
  return (
    <StopsByRouteQuery
      route={route}
      skip={
        !route || !route.routeId || !route.dateBegin || journeyStops.length !== 0
      }>
      {({stops}) => {
        const stopsList = journeyStops.length !== 0 ? journeyStops : stops;

        return stopsList.map((stop, index, arr) => {
          // Funnily enough, the first stop is last in the array.
          const isFirst = index === 0;
          // ...and the last stop is first.
          const isLast = index === arr.length - 1;

          const isSelected = stop.stopId === selectedStop;

          return (
            <RouteStopMarker
              key={`stop_marker_${stop.stopId}`}
              selected={isSelected}
              firstTerminal={isFirst}
              lastTerminal={isLast}
              selectedJourney={selectedJourney}
              firstStop={arr[0]}
              stop={stop}
              date={date}
              onViewLocation={onViewLocation}
              showRadius={showRadius}
            />
          );
        });
      }}
    </StopsByRouteQuery>
  );
}

export default decorate(RouteStopsLayer);
