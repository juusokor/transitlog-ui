import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import isWithinRange from "date-fns/is_within_range";
import orderBy from "lodash/orderBy";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import {stopTimes} from "../../../helpers/stopTimes";
import styled from "styled-components";

const StopWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0 1rem 0.5rem 2rem;
  border-bottom: 1px solid var(--lighter-grey);
`;

const TimeSection = styled.p`
  margin: 0.5rem 0;
`;

const SmallLine = styled.span`
  display: block;
  font-size: 0.75rem;
`;

export default ({
  stopName,
  stop,
  originDeparture,
  isFirstTerminal,
  isLastTerminal,
  journeyPositions,
  date,
}) => {
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
      parseInt(departure.direction) ===
        parseInt(get(firstPosition, "direction_id", 0))
  );

  const {departure: stopDeparture, arrival: stopArrival} = stopTimes(
    originDeparture,
    stopPositions,
    stopDepartures,
    date
  );

  const endOfStream =
    get(stopDeparture, "event.received_at_unix", 0) ===
    get(journeyPositions, `[${journeyPositions.length - 1}].received_at_unix`, 0);

  return (
    <StopWrapper>
      <Heading level={5}>
        {stopName}: {stop.stopId} ({stop.shortId}) - {stop.nameFi}
      </Heading>
      {stopPositions[0] && (
        <TimeSection>
          Arrival:{" "}
          <strong style={{color: stopArrival.color}}>
            {stopArrival.observedMoment.format("HH:mm:ss")}
          </strong>
          {stopArrival.unreliable && "(?)"}
        </TimeSection>
      )}
      <TimeSection>
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
        {endOfStream && (
          <SmallLine>End of HFP stream used as stop departure.</SmallLine>
        )}
      </TimeSection>
    </StopWrapper>
  );
};
