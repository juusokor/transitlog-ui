import React from "react";
import flow from "lodash/flow";
import RouteStop from "./RouteStop";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("state")
);

const JourneyStopsLayer = decorate(
  ({
    state: {date, stop: selectedStop, highlightedStop, selectedJourney},
    onViewLocation,
    showRadius,
    journey = null,
  }) => {
    if (journey && journey.departures) {
      return journey.departures.map((departure, index, arr) => {
        if (!departure || !departure.stop) {
          return null;
        }

        const isFirst = index === 0;
        const isLast = index === arr.length - 1;

        const isSelected = departure.stopId === selectedStop;
        const isHighlighted = departure.stopId === highlightedStop;

        return (
          <RouteStop
            key={`journey_stop_marker_${departure.stopId}_${departure.index}_${
              departure.id
            }`}
            selected={isSelected}
            highlighted={isHighlighted}
            firstTerminal={isFirst}
            lastTerminal={isLast}
            selectedJourney={selectedJourney}
            firstStop={arr[0]}
            stop={departure.stop}
            departure={departure}
            date={date}
            onViewLocation={onViewLocation}
            showRadius={showRadius}
          />
        );
      });
    }

    return null;
  }
);

export default JourneyStopsLayer;
