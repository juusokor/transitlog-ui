import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import isWithinRange from "date-fns/is_within_range";
import orderBy from "lodash/orderBy";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import {stopTimes} from "../../../helpers/stopTimes";
import styled from "styled-components";
import {SmallText, StopElementsWrapper, StopMarker} from "./elements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmallRight,
} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import {applyTimeOffset} from "./applyTimeOffset";

const StopWrapper = styled.div`
  padding: 0 1rem 0 0;
  margin-left: 1.75rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const StopContent = styled.div`
  padding: 0 1.75rem
    ${({terminus = "destination"}) =>
      terminus === "destination" ? "1rem" : "0.25rem"}
    0.75rem;
  width: 100%;
`;

const StopHeading = styled(Heading).attrs({level: 5})`
  margin-top: 0.2rem;
  color: var(--dark-grey);
  font-size: 1rem;
  font-weight: normal;
`;

const TimeHeading = styled.div`
  font-size: 0.75rem;
  color: var(--light-grey);
  margin-bottom: 0.2rem;
`;

const StopArrivalTime = styled(TagButton)`
  margin: 0 0 0.5rem;
`;

const StopDepartureTime = styled(TagButton)``;

export default ({
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

  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  let arrivalTimeInfo = null;
  let arrivalWasLate = false;

  if (isFirstTerminal) {
    // The arrival at the first stop should be [terminal time]
    // minutes before the scheduled departure.
    // TODO: provide real terminal time when available
    arrivalTimeInfo = applyTimeOffset(
      stopDeparture.plannedMoment,
      stopArrival.observedMoment,
      3
    );

    arrivalWasLate = arrivalTimeInfo.diff < 180;
  }

  return (
    <StopWrapper>
      <StopElementsWrapper
        color={stopColor}
        terminus={
          isFirstTerminal ? "origin" : isLastTerminal ? "destination" : false
        }>
        <StopMarker color={stopColor} />
      </StopElementsWrapper>
      <StopContent
        terminus={
          isFirstTerminal ? "origin" : isLastTerminal ? "destination" : false
        }>
        <StopHeading>
          {stop.stopId} ({stop.shortId}) - {stop.nameFi}
        </StopHeading>
        <TimeHeading>Arrival</TimeHeading>
        {arrivalTimeInfo !== null ? (
          <StopArrivalTime>
            <PlainSlot>{arrivalTimeInfo.offsetTime.format("HH:mm:ss")}</PlainSlot>
            <ColoredBackgroundSlot
              color="white"
              backgroundColor={arrivalWasLate ? "var(--red)" : "var(--light-green)"}>
              {arrivalTimeInfo.sign}
              {doubleDigit(arrivalTimeInfo.diffMinutes)}:
              {doubleDigit(arrivalTimeInfo.diffSeconds)}
            </ColoredBackgroundSlot>
            <PlainSlotSmallRight>
              {stopArrival.observedMoment.format("HH:mm:ss")}
            </PlainSlotSmallRight>
          </StopArrivalTime>
        ) : (
          <StopArrivalTime>
            <PlainSlotSmallRight>
              {stopArrival.observedMoment.format("HH:mm:ss")}
            </PlainSlotSmallRight>
          </StopArrivalTime>
        )}
        <TimeHeading>Departure</TimeHeading>
        <StopDepartureTime>
          <PlainSlot>{stopDeparture.plannedMoment.format("HH:mm:ss")}</PlainSlot>
          <ColoredBackgroundSlot
            color={stopDeparture.delayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(
              stopDeparture.delayType,
              "var(--light-green)"
            )}>
            {stopDeparture.sign}
            {doubleDigit(get(stopDeparture, "minutes", 0))}:
            {doubleDigit(get(stopDeparture, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmallRight>
            {stopDeparture.observedMoment.format("HH:mm:ss")}
          </PlainSlotSmallRight>
        </StopDepartureTime>
        {endOfStream && (
          <SmallText>End of HFP stream used as stop departure.</SmallText>
        )}
      </StopContent>
    </StopWrapper>
  );
};
