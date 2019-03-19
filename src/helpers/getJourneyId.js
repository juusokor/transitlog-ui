import {getJourneyObject} from "./getJourneyObject";

const getJourneyId = (journey = null, matchInstance = true) => {
  if (!journey) {
    return "";
  }

  if (journey.id) {
    const idStr = journey.id;
    return !matchInstance ? idStr.replace(/.$/, "0") : idStr;
  }

  let journeyItem = journey;

  if (typeof journey.oday === "string") {
    journeyItem = getJourneyObject(journey);
  }

  return getJourneyIdFromJourney(journeyItem, matchInstance);
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

export default getJourneyId;
