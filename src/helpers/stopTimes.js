import doubleDigit from "./doubleDigit";
import {diffDepartureJourney} from "./diffDepartureJourney";
import getDelayType from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";
import moment from "moment-timezone";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";
import get from "lodash/get";
import {TIMEZONE} from "../constants";

/*
  TODO: Use this in all places where calculations like this need to be made.
 */

export const stopTimes = (
  originDeparture,
  positions = [],
  departuresOrDeparture,
  date
) => {
  const departureEvent = positions[0];

  let journeyDeparture = departuresOrDeparture;

  if (Array.isArray(departuresOrDeparture) && departureEvent) {
    journeyDeparture = departuresOrDeparture.find(
      (departure) =>
        `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}:00` ===
        departureEvent.journey_start_time
    );

    if (!journeyDeparture) {
      journeyDeparture = departuresOrDeparture.find(
        (dep) => dep.departureId === originDeparture.departureId
      );
    }
  }

  if (!journeyDeparture || !departureEvent) {
    return false;
  }

  const departureDiff = diffDepartureJourney(departureEvent, journeyDeparture, date);
  const departureDelayType = getDelayType(get(departureDiff, "diff", false));
  const departureColor = getTimelinessColor(departureDelayType, "#000");

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false;
  let arrivalEvent = departureEvent;

  if (departureEvent) {
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
  }

  const arrivalTime = get(arrivalEvent, "received_at", null);
  let arrivalMoment = null;

  if (arrivalTime) {
    arrivalMoment = moment.tz(arrivalTime, TIMEZONE);
  }

  let plannedDepartureMoment = get(departureDiff, "plannedMoment", null);

  if (!plannedDepartureMoment) {
    plannedDepartureMoment = getAdjustedDepartureDate(journeyDeparture, date);
  }

  return {
    departure: journeyDeparture,
    departureEvent,
    delayType: departureDelayType,
    color: departureColor,
    departureDiff,
    departureMoment: get(departureDiff, "observedMoment", null),
    plannedDepartureMoment,
    // Mark the arrival event as unreliable if a specific arrival event could be found.
    // Also check that the arrival event isn't the end of the position feed.
    arrivalIsUnreliable:
      !doorDidOpen ||
      arrivalEvent.received_at_unix === departureEvent.received_at_unix ||
      arrivalEvent.received_at_unix === departureEvent.received_at_unix,
    arrivalEvent,
    arrivalMoment: arrivalMoment,
    plannedArrivalMoment: getAdjustedDepartureDate(journeyDeparture, date, true),
  };
};
