import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import getDelayType from "../../helpers/getDelayType";
import DepartureJourneyQuery from "../../queries/DepartureJourneyQuery";
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
import {combineDateAndTime} from "../../helpers/time";

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

@observer
class TimetableDeparture extends Component {
  selectedJourneyRef = React.createRef();
  prevOffsetTop = 0;
  clickedJourney = false;

  componentDidUpdate() {
    const {setSelectedJourneyOffset} = this.props;

    if (!this.clickedJourney && this.selectedJourneyRef.current) {
      let offset = get(this.selectedJourneyRef, "current.offsetTop", null);

      if (offset && offset !== this.prevOffsetTop) {
        this.prevOffsetTop = offset;
        setSelectedJourneyOffset(offset);
      }
    }
  }

  onClickJourney = (departureData) => {
    const clickCb = this.props.onClick(departureData);

    return (e) => {
      e.preventDefault();
      this.clickedJourney = true;
      clickCb(e);
    };
  };

  render() {
    const {
      departure,
      date,
      stop,
      selectedJourney,
      selectedTimeDeparture,
    } = this.props;

    const {
      modes: {nodes: modes},
    } = stop;

    const stopMode = modes[0];

    let scrollToTime = false;

    if (
      selectedTimeDeparture.hours === departure.hours &&
      selectedTimeDeparture.minutes === departure.minutes
    ) {
      scrollToTime = true;
    }

    return (
      <DepartureJourneyQuery date={date} departure={departure}>
        {({journey}) => {
          const departureData = {
            ...departure,
            journey,
          };

          const plannedObservedDiff = diffDepartureJourney(journey, departure, date);
          const observedTimeString = plannedObservedDiff
            ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
            : "";

          const delayType = plannedObservedDiff
            ? getDelayType(plannedObservedDiff.diff)
            : "none";

          const journeyIsSelected =
            selectedJourney &&
            getJourneyId(selectedJourney) === getJourneyId(journey);

          return (
            <TagButton
              ref={
                journeyIsSelected || scrollToTime ? this.selectedJourneyRef : null
              }
              selected={journeyIsSelected}
              onClick={this.onClickJourney(departureData)}>
              <ColoredIconSlot
                color={get(transportColor, stopMode, "var(--light-grey)")}>
                <TransportIcon mode={stopMode} />
                {parseLineNumber(departure.routeId)}
              </ColoredIconSlot>
              <PlainSlot>{doubleDigit(departure.minutes)}</PlainSlot>
              {plannedObservedDiff && (
                <>
                  <ColoredBackgroundSlot
                    color={delayType === "late" ? "var(--dark-grey)" : "white"}
                    backgroundColor={
                      delayType === "early"
                        ? "var(--red)"
                        : delayType === "late"
                        ? "var(--yellow)"
                        : "var(--light-green)"
                    }>
                    {plannedObservedDiff.sign}
                    {doubleDigit(plannedObservedDiff.minutes)}:
                    {doubleDigit(plannedObservedDiff.seconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmallRight>{observedTimeString}</PlainSlotSmallRight>
                </>
              )}
            </TagButton>
          );
        }}
      </DepartureJourneyQuery>
    );
  }
}

export default TimetableDeparture;
