import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import getDelayType from "../../helpers/getDelayType";
import timingStopIcon from "../../icon-time1.svg";
import {transportColor} from "../transportModes";
import {
  ColoredBackgroundSlot,
  PlainSlot,
  ColoredSlot,
  TagButton,
  PlainSlotSmall,
} from "../TagButton";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import styled from "styled-components";
import getJourneyId from "../../helpers/getJourneyId";
import {secondsToTimeObject, getNormalTime} from "../../helpers/time";
import {parseLineNumber} from "../../helpers/parseLineNumber";

const ListRow = styled.div`
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  margin: 0;
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};
`;

const LineSlot = styled(ColoredSlot)`
  font-size: 0.9333rem;
  white-space: nowrap;
`;

const PlannedTimeSlot = styled(PlainSlot)`
  min-width: 5.25rem;
`;

const TimingIcon = styled.img`
  width: 0.95rem;
  height: 0.95rem;
  display: block;
  margin-left: auto;
  margin-bottom: 0;
`;

const TimetableButton = styled(TagButton)`
  justify-content: flex-start;
`;

const ObservedTimeDisplay = styled(PlainSlotSmall)`
  margin-left: auto;
`;

@observer
class TimetableDeparture extends Component {
  renderListRow = (journeyIsSelected, departure, color, mode, isTimingStop) => (
    children = null,
    onClick
  ) => (
    <ListRow selected={journeyIsSelected}>
      <TimetableButton
        hasData={!!children}
        selected={journeyIsSelected}
        onClick={onClick}>
        <LineSlot color={color}>
          {parseLineNumber(departure.routeId)}/{departure.direction}
        </LineSlot>
        <PlannedTimeSlot>
          {getNormalTime(departure.plannedDepartureTime.departureTime).slice(0, -3)}
          {isTimingStop && <TimingIcon src={timingStopIcon} />}
        </PlannedTimeSlot>
        {children}
      </TimetableButton>
    </ListRow>
  );

  render() {
    const {stop, departure, onClick, selectedJourney} = this.props;
    const {modes = []} = stop;

    const stopMode = modes[0];
    const currentTransportColor = get(transportColor, stopMode, "var(--light-grey)");
    const selectedJourneyId = getJourneyId(selectedJourney);
    const isTimingStop = departure.isTimingStop;

    const journeyIsSelected =
      !!selectedJourneyId &&
      departure.journey &&
      selectedJourneyId === getJourneyId(departure.journey);

    const renderListRow = this.renderListRow(
      journeyIsSelected,
      departure,
      currentTransportColor,
      stopMode,
      isTimingStop
    );

    const observedTime = get(departure, "observedDepartureTime", null);
    let observed = null;

    if (observedTime) {
      // Diff planned and observed times
      const observedTimeString = observedTime.departureTime;
      const diff = observedTime.departureTimeDifference;
      const delayType = getDelayType(diff);
      const {hours, minutes, seconds} = secondsToTimeObject(diff);

      observed = (
        <>
          <ColoredBackgroundSlot
            color={delayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
            {diff < 0 === "-" ? "-" : ""}
            {hours ? doubleDigit(hours) + ":" : ""}
            {doubleDigit(minutes)}:{doubleDigit(seconds)}
          </ColoredBackgroundSlot>
          <ObservedTimeDisplay>{observedTimeString}</ObservedTimeDisplay>
        </>
      );
    }
    return renderListRow(observed, onClick(departure));
  }
}

export default TimetableDeparture;
