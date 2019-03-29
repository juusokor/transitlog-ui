import getDelayType from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";
import get from "lodash/get";

export const getJourneyStopDiffs = (journeyDepartures) => {
  return journeyDepartures.map((departure, index) => {
    let departureColor = "var(--light-grey)";
    let y = 0;
    let stopId = null;
    const departureDiff = get(
      departure,
      "observedDepartureTime.departureTimeDifference",
      false
    );

    if (departureDiff) {
      const departureDelayType = getDelayType(departureDiff);
      departureColor = getTimelinessColor(departureDelayType, "var(--light-green)");
      y = departureDiff;
      stopId = departure.stopId;
    }

    return {
      x: index,
      y: y,
      y0: 0,
      departureColor: departureColor,
      stopId: stopId,
      stopName: get(departure, "stop.name", ""),
    };
  });
};
