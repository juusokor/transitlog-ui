import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import {stopTimes} from "../../../helpers/stopTimes";
import styled from "styled-components";
import {
  SmallText,
  StopElementsWrapper,
  StopMarker,
  TimingStopMarker,
} from "./elements";
import {
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmallRight,
} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import ArrowRightLong from "../../../icons/ArrowRightLong";

const StopWrapper = styled.div`
  padding: 0;
  margin-left: 0.25rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const StopContent = styled.div`
  padding: 0 1.75rem 2rem 0.75rem;
  width: 100%;
`;

const TimeHeading = styled.div`
  font-size: 0.75rem;
  color: var(--light-grey);
  margin-bottom: 0.2rem;
`;

const StopHeading = styled(Heading).attrs({level: 5})`
  margin-top: 0.2rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  font-weight: normal;
`;

const StopArrivalTime = styled(TagButton)`
  margin: 0 0 0.5rem;
`;

const SimpleStopArrivalTime = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--dark-grey);
  font-size: 0.875rem;

  svg {
    margin-right: 0.5rem;
  }
`;

const StopDepartureTime = styled(TagButton)``;

export default ({
  stop,
  originDeparture,
  journeyPositions = [],
  date,
  onClickTime,
}) => {
  const stopPositions = orderBy(
    journeyPositions.filter((pos) => pos.next_stop_id === stop.stopId),
    "received_at_unix",
    "desc"
  );

  const departure = stop.stopDeparture;

  const stopMode = get(stop, "modes.nodes[0]", "BUS");
  const stopColor = get(transportColor, stopMode, "var(--light-grey)");

  if (!departure || stopPositions.length === 0) {
    return (
      <StopWrapper>
        <StopElementsWrapper color={stopColor}>
          <StopMarker color={stopColor} />
        </StopElementsWrapper>
        <StopContent>
          <StopHeading>
            {stop.stopId} ({stop.shortId}) - {stop.nameFi}
          </StopHeading>
        </StopContent>
      </StopWrapper>
    );
  }

  const {
    departureEvent,
    plannedDepartureMoment,
    departureMoment,
    arrivalMoment,
    plannedArrivalMoment,
    departureDelayType,
    departureDiff,
  } = stopTimes(originDeparture, stopPositions, departure, date);

  const endOfStream =
    get(departureEvent, "received_at_unix", 0) ===
    get(journeyPositions, `[${journeyPositions.length - 1}].received_at_unix`, 0);

  const stopDepartureTime = departureMoment
    ? departureMoment.format("HH:mm:ss")
    : "";

  const stopArrivalTime = arrivalMoment ? arrivalMoment.format("HH:mm:ss") : "";

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
          <strong>{stop.nameFi}</strong> {stop.stopId} ({stop.shortId})
        </StopHeading>
        {showPlannedArrivalTime ? (
          <>
            <TimeHeading>Arrival</TimeHeading>
            <StopArrivalTime onClick={onClickTime(stopArrivalTime)}>
              <PlainSlot>{plannedArrivalMoment.format("HH:mm:ss")}</PlainSlot>
              <PlainSlotSmallRight>{stopArrivalTime}</PlainSlotSmallRight>
            </StopArrivalTime>
          </>
        ) : stopArrivalTime ? (
          <SimpleStopArrivalTime>
            <ArrowRightLong fill="var(--blue)" width="0.75rem" height="0.75rem" />
            {stopArrivalTime}
          </SimpleStopArrivalTime>
        ) : (
          <SmallText>No data for stop arrival.</SmallText>
        )}
        {stopDepartureTime ? (
          <>
            {showPlannedArrivalTime && <TimeHeading>Departure</TimeHeading>}
            <StopDepartureTime onClick={onClickTime(stopDepartureTime)}>
              <PlainSlot>{plannedDepartureMoment.format("HH:mm:ss")}</PlainSlot>
              <ColoredBackgroundSlot
                color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
                backgroundColor={getTimelinessColor(
                  departureDelayType,
                  "var(--light-green)"
                )}>
                {departureDiff.sign}
                {doubleDigit(get(departureDiff, "minutes", 0))}:
                {doubleDigit(get(departureDiff, "seconds", 0))}
              </ColoredBackgroundSlot>
              <PlainSlotSmallRight>
                {departureMoment.format("HH:mm:ss")}
              </PlainSlotSmallRight>
            </StopDepartureTime>
            {endOfStream && (
              <SmallText>End of HFP stream used as stop departure.</SmallText>
            )}
          </>
        ) : (
          <SmallText>No data for stop departure.</SmallText>
        )}
      </StopContent>
    </StopWrapper>
  );
};
