import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import isWithinRange from "date-fns/is_within_range";
import orderBy from "lodash/orderBy";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import {stopTimes} from "../../../helpers/stopTimes";

export default ({stopName, stop, originDeparture, journeyPositions, date}) => {
  const firstPosition = journeyPositions[0];
  const dayType = getDayTypeFromDate(date);

  const stopPositions = orderBy(
    journeyPositions.filter((pos) => pos.next_stop_id === stop.stopId),
    "received_at_unix",
    "desc"
  );

  const stopDepartures = get(stop, "departures.nodes", []).filter(
    (departure) =>
      isWithinRange(date, departure.dateBegin, departure.dateEnd) &&
      departure.dayType === dayType &&
      departure.routeId === firstPosition.route_id &&
      parseInt(departure.direction) === parseInt(firstPosition.direction_id)
  );

  const {departure: stopDeparture, arrival: stopArrival} = stopTimes(
    originDeparture,
    stopPositions,
    stopDepartures,
    date
  );

  return (
    <div>
      <Heading level={5}>
        {stopName}: {stop.stopId} ({stop.shortId}) - {stop.nameFi}
      </Heading>

      {stopPositions[0] && (
        <p>
          Arrival:{" "}
          <strong style={{color: stopArrival.color}}>
            {stopArrival.observedMoment.format("HH:mm:ss")}
          </strong>
        </p>
      )}
      <p>
        Departure: {stopDeparture.plannedMoment.format("HH:mm:ss")}
        {stopPositions[0] && (
          <>
            {" "}
            /{" "}
            <strong style={{color: stopDeparture.color}}>
              {stopDeparture.observedMoment.format("HH:mm:ss")}
            </strong>
          </>
        )}
      </p>
    </div>
  );
};
