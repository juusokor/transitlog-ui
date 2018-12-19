import doubleDigit from "./doubleDigit";
import {diffDepartureJourney} from "./diffDepartureJourney";
import getDelayType from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";
import moment from "moment-timezone";
import get from "lodash/get";

export const stopTimes = (originDeparture, positions, departures, date) => {
  const firstPosition = positions[0];

  let journeyDeparture = departures.find(
    (departure) =>
      `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}:00` ===
      firstPosition.journey_start_time
  );

  if (!journeyDeparture) {
    journeyDeparture = departures.find(
      (dep) => dep.departureId === originDeparture.departureId
    );
  }

  const departureDiff = diffDepartureJourney(firstPosition, journeyDeparture, date);

  const departureDelayType = getDelayType(departureDiff.diff);
  const departureColor = getTimelinessColor(departureDelayType, "#000");

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false;
  let arrivalEvent = firstPosition;

  for (const positionIndex in positions) {
    const position = positions[positionIndex];

    if (doorDidOpen && !position.drst) {
      arrivalEvent = positions[positionIndex - 1];
      break;
    }

    if (!doorDidOpen && !!position.drst) {
      doorDidOpen = true;
    }
  }

  return {
    departure: {
      event: firstPosition,
      delayType: departureDelayType,
      color: departureColor,
      plannedMoment: departureDiff.plannedMoment,
      observedMoment: departureDiff.observedMoment,
      diff: departureDiff.diff,
    },
    arrival: {
      // Mark the arrival event as unreliable if a specific arrival event could be found.
      // Also check that the arrival event isn't the end of the position feed.
      unreliable:
        !doorDidOpen ||
        arrivalEvent.received_at_unix === firstPosition.received_at_unix ||
        arrivalEvent.received_at_unix === firstPosition.received_at_unix,
      event: arrivalEvent,
      observedMoment: moment.tz(arrivalEvent.received_at, "Europe/Helsinki"),
    },
  };
};
