import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import getDelayType from "../../helpers/getDelayType";
import timingStopIcon from "../../icon-time1.svg";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
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
import {createCompositeJourney} from "../../stores/journeyActions";

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

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
          {doubleDigit(departure.hours)}:{doubleDigit(departure.minutes)}
          {isTimingStop && <TimingIcon src={timingStopIcon} />}
        </PlannedTimeSlot>
        {children}
      </TimetableButton>
    </ListRow>
  );

  render() {
    const {departure, date, stop, onClick, selectedJourney} = this.props;

    const {
      modes: {nodes: modes},
    } = stop;

    const stopMode = modes[0];
    const currentTransportColor = get(transportColor, stopMode, "var(--light-grey)");
    const selectedJourneyId = getJourneyId(selectedJourney);
    const isTimingStop = !!get(stop, "routeSegmentsForDate.nodes", []).find(
      (segment) =>
        segment.timingStopType !== 0 &&
        segment.routeId === departure.routeId &&
        segment.direction === departure.direction
    );

    const originDeparture = get(departure, "originDeparture", null);
    const originDepartureTime = originDeparture
      ? `${doubleDigit(get(originDeparture, "hours"))}:${doubleDigit(
          get(originDeparture, "minutes")
        )}:00`
      : "";

    const journeyIsSelected =
      !!selectedJourneyId &&
      selectedJourneyId ===
        getJourneyId(createCompositeJourney(date, departure, originDepartureTime, 0));

    const renderListRow = this.renderListRow(
      journeyIsSelected,
      departure,
      currentTransportColor,
      stopMode,
      isTimingStop
    );

    const event = get(departure, "observed", null);

    let plannedObservedDiff = null;
    let observedTimeString = "";
    let delayType = "none";

    if (event) {
      // Diff planned and observed times
      plannedObservedDiff = diffDepartureJourney(event, departure, date);
      observedTimeString = plannedObservedDiff
        ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
        : "";

      delayType = plannedObservedDiff ? getDelayType(plannedObservedDiff.diff) : "none";
    }

    const hfpChildren = plannedObservedDiff ? (
      <>
        <ColoredBackgroundSlot
          color={delayType === "late" ? "var(--dark-grey)" : "white"}
          backgroundColor={getTimelinessColor(delayType, "var(--light-green)")}>
          {plannedObservedDiff.sign === "-" ? "-" : ""}
          {doubleDigit(plannedObservedDiff.minutes)}:
          {doubleDigit(plannedObservedDiff.seconds)}
        </ColoredBackgroundSlot>
        <ObservedTimeDisplay>{observedTimeString}</ObservedTimeDisplay>
      </>
    ) : null;

    return renderListRow(hfpChildren, onClick(departure));
  }
}

export default TimetableDeparture;
