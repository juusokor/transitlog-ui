import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import isWithinRange from "date-fns/is_within_range";
import orderBy from "lodash/orderBy";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import {stopTimes as getStopTimes} from "../../../helpers/stopTimes";
import styled from "styled-components";
import {StopElementsWrapper, StopMarker, SmallText} from "./elements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmall,
} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import CalculateTerminalTime from "./CalculateTerminalTime";
import {Text} from "../../../helpers/text";

const StopWrapper = styled.div`
  padding: 0 1rem 0 0;
  margin-left: 0.75rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const StopContent = styled.div`
  padding: 0 1.25rem 2rem 0.75rem;
  width: 100%;
`;

const StopHeading = styled(Heading).attrs({level: 5})`
  margin-top: 0.2rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  font-weight: normal;
`;

const TimeHeading = styled.div`
  font-size: 0.75rem;
  color: var(--light-grey);
  margin-bottom: 0.2rem;
  margin-top: 1rem;
`;

const StopArrivalTime = styled(TagButton)`
  margin: 0 0 0.5rem;
`;

const StopDepartureTime = styled(TagButton)``;

export default ({
  stop,
  originDeparture,
  isFirstTerminal = false,
  isLastTerminal = false,
  journeyPositions = [],
  date,
  onClickTime,
  // The origin stop times are needed in other places too,
  // so we can get it here if it has already been calculated.
  stopTimes: precalculatedStopTimes,
}) => {
  let stopTimes = false;

  if (precalculatedStopTimes) {
    stopTimes = precalculatedStopTimes;
  } else if (
    stop.departures &&
    stop.departures.nodes.length !== 0 &&
    journeyPositions.length !== 0
  ) {
    const firstPosition = journeyPositions[0];
    const dayType = getDayTypeFromDate(date);

    const stopPositions = orderBy(
      journeyPositions.filter((pos) => pos.next_stop_id === stop.stopId),
      "received_at_unix",
      "desc"
    );

    const stopDepartures = get(stop, "departures.nodes", []).filter(
      (departure) =>
        isWithinRange(
          date,
          get(departure, "dateBegin"),
          get(departure, "dateEnd")
        ) &&
        get(departure, "dayType") === dayType &&
        get(departure, "routeId") === get(firstPosition, "route_id") &&
        get(departure, "departureId", -1) ===
          get(originDeparture, "departureId", 0) &&
        parseInt(departure.direction) ===
          parseInt(get(firstPosition, "direction_id", 0))
    );

    stopTimes = getStopTimes(originDeparture, stopPositions, stopDepartures, date);
  }

  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  // Bail here if we don't have data about stop arrival and departure times.
  if (!stopTimes) {
    return (
      <StopWrapper>
        <StopElementsWrapper
          color={stopColor}
          terminus={
            isFirstTerminal ? "origin" : isLastTerminal ? "destination" : false
          }>
          <StopMarker color={stopColor} />
        </StopElementsWrapper>
        <StopContent>
          <StopHeading>
            <strong>{stop.nameFi}</strong> {stop.stopId} ({stop.shortId})
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  const {
    departure,
    plannedDepartureMoment,
    departureMoment,
    arrivalEvent,
    arrivalMoment,
    delayType,
    departureDiff,
  } = stopTimes;

  const stopArrivalTime = arrivalMoment.format("HH:mm:ss");
  const stopDepartureTime = departureMoment.format("HH:mm:ss");

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
          <strong>{stop.nameFi}</strong> {stop.stopId} ({stop.shortId})
        </StopHeading>
        {isFirstTerminal && (
          <CalculateTerminalTime
            date={date}
            departure={departure}
            event={arrivalEvent}>
            {({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) => (
              <>
                <TimeHeading>
                  <Text>journey.arrival</Text>
                </TimeHeading>
                <StopArrivalTime onClick={onClickTime(stopArrivalTime)}>
                  <PlainSlot
                    style={{
                      fontStyle: "italic",
                      fontSize: "0.925rem",
                      lineHeight: "1.2rem",
                    }}>
                    {offsetTime.format("HH:mm:ss")}*
                  </PlainSlot>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                    {sign === "-" ? "-" : ""}
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmall>{stopArrivalTime}</PlainSlotSmall>
                </StopArrivalTime>
                <SmallText>
                  * <Text>journey.departure_minus_terminal</Text>
                </SmallText>
              </>
            )}
          </CalculateTerminalTime>
        )}
        {isFirstTerminal ? (
          <>
            <TimeHeading>
              <Text>journey.departure</Text>
            </TimeHeading>
            <StopDepartureTime onClick={onClickTime(stopDepartureTime)}>
              <PlainSlot>{plannedDepartureMoment.format("HH:mm:ss")}</PlainSlot>
              <ColoredBackgroundSlot
                color={delayType === "late" ? "var(--dark-grey)" : "white"}
                backgroundColor={getTimelinessColor(
                  delayType,
                  "var(--light-green)"
                )}>
                {departureDiff.sign === "-" ? "-" : ""}
                {doubleDigit(get(departureDiff, "minutes", 0))}:
                {doubleDigit(get(departureDiff, "seconds", 0))}
              </ColoredBackgroundSlot>
              <PlainSlotSmall>{departureMoment.format("HH:mm:ss")}</PlainSlotSmall>
            </StopDepartureTime>
          </>
        ) : isLastTerminal ? (
          <CalculateTerminalTime
            recovery={true}
            date={date}
            departure={departure}
            event={arrivalEvent}>
            {({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) => (
              <>
                <TimeHeading>
                  <Text>journey.arrival</Text>
                </TimeHeading>
                <StopArrivalTime onClick={onClickTime(stopArrivalTime)}>
                  <PlainSlot>{offsetTime.format("HH:mm:ss")}</PlainSlot>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                    {sign === "-" ? "-" : ""}
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmall>{stopArrivalTime}</PlainSlotSmall>
                </StopArrivalTime>
              </>
            )}
          </CalculateTerminalTime>
        ) : null}
      </StopContent>
    </StopWrapper>
  );
};
