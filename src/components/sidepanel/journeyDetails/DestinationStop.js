import React, {useCallback} from "react";
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
import {applyTooltip} from "../../../hooks/useTooltip";
import get from "lodash/get";

export default ({
  departure = {},
  color,
  date,
  onClickTime,
  onSelectStop = () => {},
  onHoverStop = () => {},
}) => {
  const stopArrivalTime = get(departure, "observedArrivalTime.arrivalTime", "");
  const selectArrivalTime = useCallback(() => onClickTime(stopArrivalTime), [
    stopArrivalTime,
  ]);

  const stop = get(departure, "stop", {stopId: ""});

  const selectWithStopId = useCallback(() => onSelectStop(stop.stopId), [stop.stopId]);
  const hoverWithStopId = useCallback(() => onHoverStop(stop.stopId), [stop.stopId]);
  const hoverReset = useCallback(() => onHoverStop(""), []);

  const onStopClick = useCallback(() => {
    selectWithStopId();
    stopArrivalTime && selectArrivalTime();
  });

  const hoverProps = {
    onMouseEnter: hoverWithStopId,
    onMouseLeave: hoverReset,
  };

  if (!departure || !departure.stop) {
    return null;
  }

  // Bail here if we don't have data about stop arrival and departure times.
  if (!departure.observedArrivalTime) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={color} terminus="destination">
          <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
        </StopElementsWrapper>
        <StopContent {...hoverProps}>
          <StopHeading onClick={onStopClick} {...applyTooltip("Focus on stop")}>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  return (
    <StopWrapper>
      <StopElementsWrapper color={color} terminus="destination">
        <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
      </StopElementsWrapper>
      <StopContent terminus="destination">
        <StopHeading
          onClick={onStopClick}
          {...hoverProps}
          {...applyTooltip("Focus on stop")}>
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
