import React from "react";
import get from "lodash/get";
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
import {transportColor} from "../../transportModes";
import doubleDigit from "../../../helpers/doubleDigit";
import CalculateTerminalTime from "./CalculateTerminalTime";
import {Text} from "../../../helpers/text";
import {getNormalTime, journeyEventTime} from "../../../helpers/time";

export default ({
  stop = {},
  date,
  onClickTime,
  onSelectStop = () => {},
  onHoverStop = () => {},
}) => {
  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  const selectWithStopId = onSelectStop(stop.stopId);
  let onStopClick = selectWithStopId;

  const hoverProps = {
    onMouseEnter: onHoverStop(stop.stopId),
    onMouseLeave: onHoverStop(""),
  };

  // Bail here if we don't have data about stop arrival and departure times.
  if (!stop.arrivalEvent) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={stopColor} terminus="destination">
          <StopMarker color={stopColor} onClick={onStopClick} {...hoverProps} />
        </StopElementsWrapper>
        <StopContent>
          <StopHeading onClick={onStopClick} {...hoverProps}>
            <strong>{stop.nameFi}</strong> {stop.stopId} ({stop.shortId})
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  const {departure, arrivalEvent} = stop;
  const stopArrivalTime = journeyEventTime(arrivalEvent);

  const selectArrivalTime = onClickTime(stopArrivalTime);

  onStopClick = () => {
    selectWithStopId();
    selectArrivalTime();
  };

  return (
    <StopWrapper>
      <StopElementsWrapper color={stopColor} terminus="destination">
        <StopMarker color={stopColor} onClick={onStopClick} {...hoverProps} />
      </StopElementsWrapper>
      <StopContent terminus="destination">
        <StopHeading onClick={onStopClick} {...hoverProps}>
          <strong>{stop.nameFi}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
        </StopHeading>
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
