import {pickJourneyProps} from "./pickJourneyProps";

const getJourneyId = (journey = null) => {
  const {
    oday = null,
    journey_start_time = null,
    route_id = null,
    direction_id = null,
    instance = 0,
  } = pickJourneyProps(journey || {});

  if (!route_id || !oday || !journey_start_time) return "";

  return `journey:${oday}_${journey_start_time}_${route_id}_${direction_id}_${instance}`;
};

export default getJourneyId;
