import React from "react";
import {
  StopElementsWrapper,
  StopMarker,
  StopContent,
  StopWrapper,
  StopHeading,
  TimeHeading,
  StopArrivalTime,
} from "../../StopElements";
import {PlainSlot, ColoredBackgroundSlot, PlainSlotSmall} from "../../TagButton";
import doubleDigit from "../../../helpers/doubleDigit";
import CalculateTerminalTime from "./CalculateTerminalTime";
import {Text} from "../../../helpers/text";
import {getNormalTime} from "../../../helpers/time";

export default ({
  departure = {},
  color,
  date,
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

  // Bail here if we don't have data about stop arrival and departure times.
  if (!departure.observedArrivalTime) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={color} terminus="destination">
          <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
        </StopElementsWrapper>
        <StopContent>
          <StopHeading onClick={onStopClick} {...hoverProps}>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  const stopArrivalTime = departure.observedArrivalTime.arrivalTime;
  const selectArrivalTime = onClickTime(stopArrivalTime);

  onStopClick = () => {
    selectWithStopId();
    selectArrivalTime();
  };

  return (
    <StopWrapper>
      <StopElementsWrapper color={color} terminus="destination">
        <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
      </StopElementsWrapper>
      <StopContent terminus="destination">
        <StopHeading onClick={onStopClick} {...hoverProps}>
          <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
        </StopHeading>
        <CalculateTerminalTime
          recovery={true}
          date={date}
          departure={departure}
          event={departure.observedArrivalTime.arrivalEvent}>
          {({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) => (
            <>
              <TimeHeading>
                <Text>journey.arrival</Text>
              </TimeHeading>
              <StopArrivalTime onClick={selectArrivalTime}>
                <PlainSlot>{offsetTime.format("HH:mm:ss")}</PlainSlot>
                <ColoredBackgroundSlot
                  color="white"
                  backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                  {sign === "-" ? "-" : ""}
                  {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                </ColoredBackgroundSlot>
                <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
              </StopArrivalTime>
            </>
          )}
        </CalculateTerminalTime>
      </StopContent>
    </StopWrapper>
  );
};
