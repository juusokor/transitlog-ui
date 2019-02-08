import React from "react";
import {Heading} from "../../Typography";
import get from "lodash/get";
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
  PlainSlotSmall,
} from "../../TagButton";
import {transportColor} from "../../transportModes";
import {getTimelinessColor} from "../../../helpers/timelinessColor";
import doubleDigit from "../../../helpers/doubleDigit";
import ArrowRightLong from "../../../icons/ArrowRightLong";
import {Text} from "../../../helpers/text";
import {getNormalTime, journeyEventTime} from "../../../helpers/time";

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
          <strong>{stop.nameFi}</strong> {stop.stopId} ({stop.shortId})
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
                {departureDiff.sign}
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
