import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import getDelayType from "../../helpers/getDelayType";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import {TransportIcon, transportColor} from "../transportModes";
import {
  ColoredBackgroundSlot,
  PlainSlot,
  ColoredIconSlot,
  TagButton,
  PlainSlotSmallRight,
} from "../TagButton";
import getJourneyId from "../../helpers/getJourneyId";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import styled from "styled-components";
import Loading from "../Loading";

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

const ListRow = styled.div`
  padding: ${({selected = false}) =>
    selected ? "0.5rem 0.5rem 0.5rem 0.75rem" : "0 0.5rem 0 0.75rem"};
  margin: ${({selected = false}) => (selected ? "0" : "0.5rem 0")};
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};
`;

const InlineLoading = styled(Loading).attrs({inline: true, size: 18})`
  color: red;
  align-self: center;
  margin-left: auto;
  margin-top: 5px;
`;

@observer
class TimetableDeparture extends Component {
  render() {
    const {
      departure,
      journey,
      date,
      stop,
      selectedJourney,
      onClick,
      focusRef,
      loading,
    } = this.props;

    const {
      modes: {nodes: modes},
    } = stop;

    const stopMode = modes[0];

    // Bake the hfp data into the departure object
    // for selecting the journey when clicked.
    const departureData = {
      ...departure,
      journey,
    };

    // Diff planned and observed times
    const plannedObservedDiff = diffDepartureJourney(journey, departure, date);
    const observedTimeString = plannedObservedDiff
      ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
      : "";

    const delayType = plannedObservedDiff
      ? getDelayType(plannedObservedDiff.diff)
      : "none";

    const journeyIsSelected =
      selectedJourney && getJourneyId(selectedJourney) === getJourneyId(journey);

    return (
      <ListRow selected={journeyIsSelected}>
        <TagButton
          ref={focusRef}
          selected={journeyIsSelected}
          onClick={onClick(departureData)}>
          <ColoredIconSlot
            color={get(transportColor, stopMode, "var(--light-grey)")}>
            <TransportIcon mode={stopMode} />
            {parseLineNumber(departure.routeId)}
          </ColoredIconSlot>
          <PlainSlot>
            {doubleDigit(departure.hours)}:{doubleDigit(departure.minutes)}
          </PlainSlot>
          {plannedObservedDiff ? (
            <>
              <ColoredBackgroundSlot
                color={delayType === "late" ? "var(--dark-grey)" : "white"}
                backgroundColor={getTimelinessColor(
                  delayType,
                  "var(--light-green)"
                )}>
                {plannedObservedDiff.sign}
                {doubleDigit(plannedObservedDiff.minutes)}:
                {doubleDigit(plannedObservedDiff.seconds)}
              </ColoredBackgroundSlot>
              <PlainSlotSmallRight>{observedTimeString}</PlainSlotSmallRight>
            </>
          ) : loading ? (
            <InlineLoading />
          ) : null}
        </TagButton>
      </ListRow>
    );
  }
}

export default TimetableDeparture;
