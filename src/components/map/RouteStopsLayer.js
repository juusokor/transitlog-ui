import React from "react";
import flow from "lodash/flow";
import RouteStopMarker from "./RouteStopMarker";
import {inject, observer} from "mobx-react";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import {app} from "mobx-app";

const decorate = flow(
  observer,
  inject(app("state"))
);

function RouteStopsLayer({
  state: {date, stop: selectedStop, selectedJourney},
  route,
  onViewLocation,
  showRadius,
  positions = [],
}) {
  return (
    <StopsByRouteQuery route={route}>
      {({stops}) =>
        stops.map((stop, index) => {
          // Funnily enough, the first stop is last in the array.
          const isFirst = index === stops.length - 1;
          // ...and the last stop is first.
          const isLast = index === 0;

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
              showRadius={showRadius}
            />
          );
        })
      }
    </StopsByRouteQuery>
  );
}

export default decorate(RouteStopsLayer);
