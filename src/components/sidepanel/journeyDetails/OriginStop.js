import React, {useCallback} from "react";
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
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import CalculateTerminalTime from "./CalculateTerminalTime";
import {Text} from "../../../helpers/text";
import {applyTooltip} from "../../../hooks/useTooltip";
import {getNormalTime, secondsToTimeObject} from "../../../helpers/time";
import styled from "styled-components";
import {observer} from "mobx-react-lite";
import getDelayType from "../../../helpers/getDelayType";

const OriginStopContent = styled(StopContent)`
  padding-bottom: ${({stopsExpanded = false}) => (!stopsExpanded ? "1.5rem" : "2.75rem")};
`;

const OriginStop = observer(
  ({
    departure = null,
    color,
    date,
    onClickTime = () => {},
    onSelectStop = () => {},
    onHoverStop = () => {},
    stopsExpanded,
  }) => {
    if (!departure || !departure.stop) {
      return null;
    }

    const stop = departure.stop;

    const selectWithStopId = useCallback(() => onSelectStop(stop.stopId), [stop.stopId]);
    const hoverWithStopId = useCallback(() => onHoverStop(stop.stopId), [stop.stopId]);
    const hoverReset = useCallback(() => onHoverStop(""), []);

    let onStopClick = selectWithStopId;

    const hoverProps = {
      onMouseEnter: hoverWithStopId,
      onMouseLeave: hoverReset,
    };

    // Bail here if we don't have data about departure arrival and departure times.
    if (!departure.observedDepartureTime || !departure.observedArrivalTime) {
      return (
        <StopWrapper>
          <StopElementsWrapper color={color} terminus={"origin"}>
            <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
          </StopElementsWrapper>
          <OriginStopContent stopsExpanded={stopsExpanded} {...hoverProps}>
            <StopHeading onClick={onStopClick} {...applyTooltip("Focus on stop")}>
              <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")}
              )
            </StopHeading>
          </OriginStopContent>
        </StopWrapper>
      );
    }

    const stopArrivalTime = get(departure, "observedArrivalTime.arrivalTime", "");
    const stopDepartureTime = get(departure, "observedDepartureTime.departureTime", "");

    const selectDepartureTime = () => onClickTime(stopDepartureTime);

    onStopClick = () => {
      selectWithStopId();
      selectDepartureTime();
    };

    const departureDiff = departure.observedDepartureTime.departureTimeDifference;
    const departureDelayType = getDelayType(departureDiff);
    const departureDiffTime = secondsToTimeObject(departureDiff);

    return (
      <StopWrapper>
        <StopElementsWrapper color={color} terminus="origin">
          <StopMarker color={color} onClick={onStopClick} {...hoverProps} />
        </StopElementsWrapper>
        <OriginStopContent
          terminus="origin"
          stopsExpanded={stopsExpanded}
          {...hoverProps}>
          <StopHeading onClick={onStopClick} {...applyTooltip("Focus on stop")}>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </StopHeading>
          <CalculateTerminalTime
            date={date}
            departure={departure}
            event={departure.observedArrivalTime.arrivalEvent}>
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
              {departureDiff < 0 ? "-" : ""}
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
        </OriginStopContent>
      </StopWrapper>
    );
  }
);

export default OriginStop;
