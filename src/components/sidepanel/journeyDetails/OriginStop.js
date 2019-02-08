import React from "react";
import get from "lodash/get";
import {
  StopElementsWrapper,
  StopMarker,
  SmallText,
  StopDepartureTime,
  StopArrivalTime,
  TimeHeading,
  StopHeading,
  StopContent,
  StopWrapper,
} from "../../StopElements";
import {PlainSlot, ColoredBackgroundSlot, PlainSlotSmall} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import CalculateTerminalTime from "./CalculateTerminalTime";
import {Text} from "../../../helpers/text";
import {getNormalTime, journeyEventTime} from "../../../helpers/time";
import styled from "styled-components";

const OriginStopContent = styled(StopContent)`
  padding-bottom: 2.5rem;
`;

export default ({stop = {}, date, onClickTime}) => {
  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  // Bail here if we don't have data about stop arrival and departure times.
  if (!stop.departureEvent) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={stopColor} terminus={"origin"}>
          <StopMarker color={stopColor} />
        </StopElementsWrapper>
        <OriginStopContent>
          <StopHeading>
            <strong>{stop.nameFi}</strong> {stop.stopId} (
            {stop.shortId.replace(/ /g, "")})
          </StopHeading>
        </OriginStopContent>
      </StopWrapper>
    );
  }

  const {
    departure,
    plannedDepartureMoment,
    departureMoment,
    delayType,
    departureDiff,
    departureEvent,
    arrivalEvent,
  } = stop;

  const stopArrivalTime = journeyEventTime(arrivalEvent);
  const stopDepartureTime = journeyEventTime(departureEvent);

  return (
    <StopWrapper>
      <StopElementsWrapper color={stopColor} terminus="origin">
        <StopMarker color={stopColor} />
      </StopElementsWrapper>
      <OriginStopContent terminus="origin">
        <StopHeading>
          <strong>{stop.nameFi}</strong> {stop.stopId} (
          {stop.shortId.replace(/ /g, "")})
        </StopHeading>
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
                  {sign}
                  {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                </ColoredBackgroundSlot>
                <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
              </StopArrivalTime>
              <SmallText>
                * <Text>journey.departure_minus_terminal</Text>
              </SmallText>
            </>
          )}
        </CalculateTerminalTime>
        <TimeHeading>
          <Text>journey.departure</Text>
        </TimeHeading>
        <StopDepartureTime onClick={onClickTime(stopDepartureTime)}>
          <PlainSlot>{plannedDepartureMoment.format("HH:mm:ss")}</PlainSlot>
          <ColoredBackgroundSlot
            color={delayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
            {departureDiff.sign}
            {doubleDigit(get(departureDiff, "minutes", 0))}:
            {doubleDigit(get(departureDiff, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmall>{departureMoment.format("HH:mm:ss")}</PlainSlotSmall>
        </StopDepartureTime>
      </OriginStopContent>
    </StopWrapper>
  );
};
