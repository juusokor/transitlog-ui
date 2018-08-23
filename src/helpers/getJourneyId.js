import get from "lodash/get";

export default (journey) => {
  const oday = get(journey, "oday", null);
  const journeyStartTime = get(journey, "journeyStartTime", null);
  const route = get(journey, "routeId", null);
  const dir = get(journey, "directionId", null);

  if (!oday || !journeyStartTime) return "";

  return `journey:${oday}_${journeyStartTime}_${route}_${dir}`;
};
