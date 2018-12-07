import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import sortBy from "lodash/sortBy";
import get from "lodash/get";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import {transportColor, TransportIcon} from "../transportModes";
import {
  ColoredIconSlot,
  TagButton,
  PlainSlot,
  ColoredBackgroundSlot,
  PlainSlotSmallRight,
} from "../TagButton";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import doubleDigit from "../../helpers/doubleDigit";
import PlusMinusInput from "../PlusMinusInput";
import {observable, action, reaction} from "mobx";
import withVehicleJourneys from "../../hoc/withVehicleJourneys";
import {sortByOperationDay} from "../../helpers/sortByOperationDay";
import {getTimelinessColor} from "../../helpers/timelinessColor";

const JourneyListRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 0.75rem;
  margin: 0.5rem 0;
  width: 100%;
  border: 0;
  max-width: none;
  font-size: 1rem;
  font-family: var(--font-family);
  background: white;

  &:first-child {
    margin-top: 1rem;
  }
`;

const HeaderRowLeft = styled.span`
  margin-right: 1rem;
  display: block;
  width: 100%;
`;

const HeadsignSlot = styled(ColoredIconSlot)`
  min-width: 4rem;
`;

const TimeSlot = styled(PlainSlot)`
  min-width: 6rem;
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
  selectedJourneyRef = React.createRef();
  @observable
  selectedJourneyOffset = 0;

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

      Journey.requestJourneys({
        time: journey.journey_start_time,
        route,
        date: journey.oday,
      });
    }

    Journey.setSelectedJourney(journey);
  };

  onSelectJourney = (journey) => (e) => {
    e.preventDefault();
    this.selectJourney(journey);
  };

  @action
  // Set the offset where the selected journey is located so we can scroll to it.
  setSelectedJourneyOffset() {
    if (this.selectedJourneyRef.current && !this.selectedJourneyOffset) {
      let offset = get(this.selectedJourneyRef, "current.offsetTop", null);

      if (offset) {
        this.selectedJourneyOffset = offset;
      }
    }
  }

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

  componentDidUpdate() {
    // Get the scroll offset of the currently selected or focused part of the list.
    // Will only be set once per instance so it is safe to call here.
    this.setSelectedJourneyOffset();
  }

  // Selects a journey based on its index in the list.
  updateVehicleAndJourneySelection = (nextJourneyIndex) => {
    const {
      state: {selectedJourney, vehicle, date, route},
      positions: journeys,
      Journey,
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

      const vehicleId = get(nextSelectedJourney, "unique_vehicle_id", "");

      // If the vehicle ID changed, fetch the journeys for the vehicle.
      if (vehicleId && vehicleId !== vehicle) {
        Journey.requestJourneys({
          vehicleId,
          date,
          route,
        });
      }
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
      sortByOperationDay(pos.journey_start_time)
    );

    return (
      <SidepanelList
        scrollOffset={this.selectedJourneyOffset}
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
                      {vehicle}, {selectedJourney.journey_start_time} /{" "}
                      {selectedJourney.direction_id}
                    </>
                  ) : (
                    vehicle
                  )}
                </NextPrevLabel>
              </PlusMinusInput>
            </HeaderRowLeft>
          </>
        }>
        {sortedPositions.map((journey) => {
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

          const plannedObservedDiff = diffDepartureJourney(journey, departure, date);
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
              key={`vehicle_journey_row_${journeyId}`}
              ref={journeyIsSelected ? this.selectedJourneyRef : null}>
              <TagButton
                selected={journeyIsSelected}
                onClick={this.onSelectJourney(journey)}>
                <HeadsignSlot color={get(transportColor, mode, "var(--light-grey)")}>
                  <TransportIcon mode={mode} />
                  {lineNumber}
                </HeadsignSlot>
                <TimeSlot>{journeyTime}</TimeSlot>
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
              </TagButton>
            </JourneyListRow>
          );
        })}
      </SidepanelList>
    );
  }
}

export default VehicleJourneys;
