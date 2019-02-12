import React from "react";
import get from "lodash/get";
import styled from "styled-components";
import {
  SmallText,
  StopElementsWrapper,
  StopMarker,
  TimingStopMarker,
  StopWrapper as DefaultStopWrapper,
  StopContent,
  StopHeading,
  TimeHeading,
  StopArrivalTime,
} from "../../StopElements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmall,
} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import ArrowRightLong from "../../../icons/ArrowRightLong";
import {Text} from "../../../helpers/text";
import {getNormalTime, journeyEventTime} from "../../../helpers/time";

const StopWrapper = styled(DefaultStopWrapper)`
  padding: 0;
  margin-left: 0.25rem;
`;

const SimpleStopArrivalTime = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0 0.75rem;
  color: var(--dark-grey);
  font-size: 0.875rem;

  svg {
    margin-right: 0.5rem;
  }
`;

const StopDepartureTime = styled(TagButton)``;

export default ({stop, date, onClickTime}) => {
  const departure = stop.departure;

  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  // Bail early if we don't have all the data yet.
  if (!departure || !stop.departureEvent) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={stopColor}>
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
    departureEvent,
    plannedDepartureMoment,
    departureMoment,
    departureDelayType,
    departureDiff,
    plannedArrivalMoment,
    arrivalEvent,
  } = stop;

  const stopDepartureTime = journeyEventTime(departureEvent);
  const stopArrivalTime = journeyEventTime(arrivalEvent);

  const isTimingStop = stop.timingStopType > 0;

  let showPlannedArrivalTime =
    (isTimingStop || !plannedDepartureMoment.isSame(plannedArrivalMoment)) &&
    stopArrivalTime;

  return (
    <StopWrapper>
      <StopElementsWrapper color={stopColor}>
        {isTimingStop ? (
          <TimingStopMarker color={stopColor} />
        ) : (
          <StopMarker color={stopColor} />
        )}
      </StopElementsWrapper>
      <StopContent>
        <StopHeading>
          <strong>{stop.nameFi}</strong> {stop.stopId} (
          {stop.shortId.replace(/ /g, "")})
        </StopHeading>
        {showPlannedArrivalTime ? (
          <>
            <TimeHeading>
              <Text>journey.arrival</Text>
            </TimeHeading>
            <StopArrivalTime onClick={onClickTime(stopArrivalTime)}>
              <PlainSlot>{plannedArrivalMoment.format("HH:mm:ss")}</PlainSlot>
              <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
            </StopArrivalTime>
          </>
        ) : arrivalEvent ? (
          <SimpleStopArrivalTime>
            <ArrowRightLong fill="var(--blue)" width="0.75rem" height="0.75rem" />
            {getNormalTime(stopArrivalTime)}
          </SimpleStopArrivalTime>
        ) : (
          <SmallText>
            <Text>filterpanel.journey.no_data</Text>
          </SmallText>
        )}
        {departureEvent ? (
          <>
            {showPlannedArrivalTime && (
              <TimeHeading>
                <Text>journey.departure</Text>
              </TimeHeading>
            )}
            <StopDepartureTime onClick={onClickTime(stopDepartureTime)}>
              <PlainSlot>{plannedDepartureMoment.format("HH:mm:ss")}</PlainSlot>
              <ColoredBackgroundSlot
                color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
                backgroundColor={getTimelinessColor(
                  departureDelayType,
                  "var(--light-green)"
                )}>
                {departureDiff.sign === "-" ? "-" : ""}
                {doubleDigit(get(departureDiff, "minutes", 0))}:
                {doubleDigit(get(departureDiff, "seconds", 0))}
              </ColoredBackgroundSlot>
              <PlainSlotSmall>{departureMoment.format("HH:mm:ss")}</PlainSlotSmall>
            </StopDepartureTime>
          </>
        ) : (
          <SmallText>
            <Text>filterpanel.journey.no_data</Text>
          </SmallText>
        )}
      </StopContent>
    </StopWrapper>
  );
};
