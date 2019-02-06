import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import sortBy from "lodash/sortBy";
import get from "lodash/get";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import {transportColor} from "../transportModes";
import {
  ColoredSlot,
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmall,
} from "../TagButton";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import doubleDigit from "../../helpers/doubleDigit";
import PlusMinusInput from "../PlusMinusInput";
import {observable, action, reaction} from "mobx";
import withVehicleJourneys from "../../hoc/withVehicleJourneys";
import {sortByTime} from "../../helpers/sortByTime";
import {getTimelinessColor} from "../../helpers/timelinessColor";

const JourneyListRow = styled.div`
  padding: ${({selected = false}) =>
    selected ? "0.5rem 0.5rem 0.5rem 0.75rem" : "0 0.5rem 0 0.75rem"};
  margin: ${({selected = false}) => (selected ? "0" : "0.5rem 0")};
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};

  &:first-child {
    margin-top: 1rem;
  }
`;

const HeaderRowLeft = styled.span`
  margin-right: 1rem;
  display: block;
  width: 100%;
`;

const HeadsignSlot = styled(ColoredSlot)``;

const TimeSlot = styled(PlainSlot)`
  min-width: 5rem;
  font-weight: normal;
  text-align: center;
`;

const NextPrevLabel = styled.div`
  padding: 0 0.7rem;
  border-radius: 0.25rem;
  border: 1px solid var(--blue);
  height: calc(2rem + 2px);
  background: var(--lightest-grey);
  flex: 1 0 75%;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

@inject(app("Filters", "Journey", "Time"))
@withVehicleJourneys
@observer
class VehicleJourneys extends Component {
  // We are modifying this in the render function so it cannot be reactive
  selectedJourneyIndex = 0;

  @observable
  nextJourneyIndex = 0;

  selectJourney = (journey) => {
    const {Time, Filters, Journey, state} = this.props;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(journey.journey_start_time);
        Filters.setVehicle(journey.unique_vehicle_id);
      }

      const route = {
        routeId: journey.route_id,
        direction: journey.direction_id + "",
      };

      Filters.setRoute(route);
    }

    Journey.setSelectedJourney(journey);
  };

  onSelectJourney = (journey) => (e) => {
    e.preventDefault();
    this.selectJourney(journey);
  };

  @action
  selectPreviousVehicleJourney = () => {
    this.nextJourneyIndex = this.selectedJourneyIndex - 1;

    // Clamp to 0
    if (this.nextJourneyIndex < 0) {
      this.nextJourneyIndex = 0;
    }
  };

  @action
  selectNextVehicleJourney = () => {
    this.nextJourneyIndex = this.selectedJourneyIndex + 1;
  };

  componentDidMount() {
    reaction(
      () => this.nextJourneyIndex,
      (nextJourneyIndex) => this.updateVehicleAndJourneySelection(nextJourneyIndex)
    );
  }

  // Selects a journey based on its index in the list.
  updateVehicleAndJourneySelection = (nextJourneyIndex) => {
    const {
      state: {selectedJourney},
      positions: journeys,
    } = this.props;

    let useIndex = nextJourneyIndex;

    if (journeys.length === 0) {
      return;
    }

    // Select the last journey if we're out of bounds
    if (useIndex > journeys.length - 1) {
      useIndex = journeys.length - 1;
    }

    const nextSelectedJourney = journeys[useIndex];

    // If the index corresponds to a journey, and it isn't already selected,
    // select it as the selected journey.
    if (
      nextSelectedJourney &&
      ((selectedJourney &&
        getJourneyId(nextSelectedJourney) !== getJourneyId(selectedJourney)) ||
        !selectedJourney)
    ) {
      this.selectJourney(nextSelectedJourney);
    }
  };

  render() {
    const {
      positions = [],
      loading,
      state: {selectedJourney, date, vehicle},
    } = this.props;

    const selectedJourneyId = getJourneyId(selectedJourney);
    // Keep track of the journey index independent of vehicle groups
    let journeyIndex = -1;

    const sortedPositions = sortBy(positions, (pos) =>
      sortByTime(pos.journey_start_time)
    );

    return (
      <SidepanelList
        loading={loading}
        header={
          <>
            <HeaderRowLeft>
              <PlusMinusInput
                plusLabel={<>&raquo;</>}
                minusLabel={<>&laquo;</>}
                onDecrease={this.selectPreviousVehicleJourney}
                onIncrease={this.selectNextVehicleJourney}>
                <NextPrevLabel>
                  {selectedJourney ? (
                    <>
                      {vehicle}, {selectedJourney.journey_start_time.slice(0, -3)}
                    </>
                  ) : (
                    vehicle
                  )}
                </NextPrevLabel>
              </PlusMinusInput>
            </HeaderRowLeft>
          </>
        }>
        {(scrollRef) =>
          sortedPositions.map((journey) => {
            journeyIndex++;
            const journeyId = getJourneyId(journey);

            const mode = get(journey, "mode", "").toUpperCase();
            const journeyTime = get(journey, "journey_start_time", "");
            const lineNumber = get(journey, "desi", "");

            const [hours, minutes] = journeyTime.split(":");

            const departure = {
              hours: parseInt(hours, 10),
              minutes: parseInt(minutes, 10),
            };

            const plannedObservedDiff = diffDepartureJourney(
              journey,
              departure,
              date
            );
            const observedTimeString = plannedObservedDiff
              ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
              : "";

            const delayType = plannedObservedDiff
              ? getDelayType(plannedObservedDiff.diff)
              : "none";

            const journeyIsSelected =
              selectedJourney && selectedJourneyId === journeyId;

            if (journeyIsSelected) {
              this.selectedJourneyIndex = journeyIndex;
            }

            return (
              <JourneyListRow
                selected={journeyIsSelected}
                key={`vehicle_journey_row_${journeyId}`}
                ref={journeyIsSelected ? scrollRef : null}>
                <TagButton
                  selected={journeyIsSelected}
                  onClick={this.onSelectJourney(journey)}>
                  <HeadsignSlot
                    color={get(transportColor, mode, "var(--light-grey)")}>
                    {lineNumber} / {journey.direction_id}
                  </HeadsignSlot>
                  <TimeSlot>{journeyTime.slice(0, -3)}</TimeSlot>
                  <ColoredBackgroundSlot
                    color={delayType === "late" ? "var(--dark-grey)" : "white"}
                    backgroundColor={getTimelinessColor(
                      delayType,
                      "var(--light-green)"
                    )}>
                    {plannedObservedDiff.sign === "-" ? "-" : ""}
                    {doubleDigit(plannedObservedDiff.minutes)}:
                    {doubleDigit(plannedObservedDiff.seconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmall>{observedTimeString}</PlainSlotSmall>
                </TagButton>
              </JourneyListRow>
            );
          })
        }
      </SidepanelList>
    );
  }
}

export default VehicleJourneys;
