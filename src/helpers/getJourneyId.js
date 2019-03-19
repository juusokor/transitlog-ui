import {pickJourneyProps} from "./pickJourneyProps";

const getJourneyId = (journey = null, matchInstance = true) => {
  if (!journey) {
    return "";
  }

  if (journey.id) {
    const idStr = journey.id;
    return !matchInstance ? idStr.replace(/.$/, "0") : idStr;
  }

  if (typeof journey.oday === "string") {
    return getJourneyIdFromEvent(journey, matchInstance);
  }

  return getJourneyIdFromJourney(journey, matchInstance);
};

const getJourneyIdFromJourney = (journey = {}, matchInstance = true) => {
  let {
    departureDate = null,
    departureTime = null,
    routeId = null,
    direction = null,
    instance = 0,
  } = journey;

  if (!routeId || !departureDate || !departureTime) return "";

  if (!matchInstance) {
    instance = 0;
  }

  return `${departureDate}_${departureTime}_${routeId}_${direction}_${instance}`;
};

const getJourneyIdFromEvent = (event, matchInstance = true) => {
  let {
    oday = null,
    journey_start_time = null,
    route_id = null,
    direction_id = null,
    instance = 0,
  } = pickJourneyProps(event || {});

  if (!route_id || !oday || !journey_start_time) return "";

  if (!matchInstance) {
    instance = 0;
  }

  return `${oday}_${journey_start_time}_${route_id}_${direction_id}_${instance}`;
};

export default getJourneyId;
