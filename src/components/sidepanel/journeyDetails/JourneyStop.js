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
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import ArrowRightLong from "../../../icons/ArrowRightLong";
import {Text} from "../../../helpers/text";
import {getNormalTime, secondsToTimeObject} from "../../../helpers/time";
import getDelayType from "../../../helpers/getDelayType";

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

export default ({
  departure,
  color,
  onClickTime,
  onSelectStop = () => {},
  onHoverStop = () => {},
}) => {
  if (!departure || !departure.stop) {
    return null;
  }

  const stop = departure.stop;

  const selectWithStopId = onSelectStop(stop.stopId);
  let onStopClick = selectWithStopId;

  const hoverProps = {
    onMouseEnter: onHoverStop(stop.stopId),
    onMouseLeave: onHoverStop(""),
  };

  // Bail early if we don't have all the data yet.
  if (!departure.observedDepartureTime) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={color}>
          {departure.isTimingStop ? (
            <TimingStopMarker color={color} onClick={onStopClick} {...hoverProps} />
          ) : (
            <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
          )}
        </StopElementsWrapper>
        <StopContent>
          <StopHeading onClick={onStopClick} {...hoverProps}>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  const stopArrivalTime = get(departure, "observedArrivalTime.arrivalTime", "");
  const stopDepartureTime = get(departure, "observedDepartureTime.departureTime", "");

  const selectDepartureTime = onClickTime(stopDepartureTime);

  onStopClick = () => {
    selectWithStopId();
    selectDepartureTime();
  };

  const departureDiff = departure.observedDepartureTime.departureTimeDifference;
  const departureDelayType = getDelayType(departureDiff);
  const departureDiffTime = secondsToTimeObject(departureDiff);

  let showPlannedArrivalTime =
    (departure.isTimingStop ||
      departure.plannedDepartureTime.departureTime !==
        departure.plannedArrivalTime.arrivalTime) &&
    stopArrivalTime;

  return (
    <StopWrapper>
      <StopElementsWrapper color={color}>
        {departure.isTimingStop ? (
          <TimingStopMarker color={color} onClick={onStopClick} {...hoverProps} />
        ) : (
          <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
        )}
      </StopElementsWrapper>
      <StopContent>
        <StopHeading onClick={onStopClick} {...hoverProps}>
          <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
        </StopHeading>
        {showPlannedArrivalTime ? (
          <>
            <TimeHeading>
              <Text>journey.arrival</Text>
            </TimeHeading>
            <StopArrivalTime onClick={onClickTime(stopArrivalTime)}>
              <PlainSlot>
                {getNormalTime(departure.plannedArrivalTime.arrivalTime)}
              </PlainSlot>
              <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
            </StopArrivalTime>
          </>
        ) : departure.observedArrivalTime ? (
          <SimpleStopArrivalTime>
            <ArrowRightLong fill="var(--blue)" width="0.75rem" height="0.75rem" />
            {getNormalTime(stopArrivalTime)}
          </SimpleStopArrivalTime>
        ) : (
          <SmallText>
            <Text>filterpanel.journey.no_data</Text>
          </SmallText>
        )}
        {showPlannedArrivalTime && (
          <TimeHeading>
            <Text>journey.departure</Text>
          </TimeHeading>
        )}
        <StopDepartureTime onClick={selectDepartureTime}>
          <PlainSlot>
            {getNormalTime(departure.plannedDepartureTime.departureTime)}
          </PlainSlot>
          <ColoredBackgroundSlot
            color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(
              departureDelayType,
              "var(--light-green)"
            )}>
            {departureDiffTime.hours > 0
              ? doubleDigit(departureDiffTime.hours) + ":"
              : ""}
            {doubleDigit(get(departureDiffTime, "minutes", 0))}:
            {doubleDigit(get(departureDiffTime, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmall>
            {getNormalTime(departure.observedDepartureTime.departureTime)}
          </PlainSlotSmall>
        </StopDepartureTime>
      </StopContent>
    </StopWrapper>
  );
};
