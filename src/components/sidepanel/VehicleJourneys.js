import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import {Text} from "../../helpers/text";
import flatMap from "lodash/flatMap";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import flatten from "lodash/flatten";
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
import {Heading} from "../Typography";
import PlusMinusInput from "../PlusMinusInput";
import {observable, action, reaction} from "mobx";
import {findJourneyStartPosition} from "../../helpers/findJourneyStartPosition";

const JourneyListRow = styled.div`
  width: 100%;
  border: 0;
  max-width: none;
  font-size: 1rem;
  outline: none;
  padding: 0;
  font-family: var(--font-family);
  background: ${({selected = false}) =>
    selected ? "var(--lightest-grey)" : "white"};
`;

const HeaderRowLeft = styled.span`
  margin-right: 1rem;
  display: block;
  width: 100%;
`;

const VehicleIdHeading = styled(Heading).attrs({level: 4})`
  width: 100%;
  margin: 0;
  padding: 0 0.75rem 1rem 1rem;
  text-align: left;
  color: inherit;
  background: transparent;
`;

const VehicleSelectButton = styled.button`
  background: none;
  font-size: 1rem;
  font-family: inherit;
  padding: 1rem 0 0;
  cursor: pointer;
  border: 0;
  outline: none;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--lighter-grey);

  &:hover {
    background-color: var(--blue);
    color: white;
  }
`;

const JourneysRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 0.5rem 1rem;
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
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

@inject(app("Filters", "Journey", "Time"))
@observer
class VehicleJourneys extends Component {
  // We are modifying this in the render function so it cannot be reactive
  selectedJourneyIndex = 0;

  @observable
  nextJourneyIndex = 0;

  groupJourneysByVehicle = (journeys) => {
    return groupBy(
      flatMap(journeys, ({journeyId, positions}) => {
        const journeyStartPosition = findJourneyStartPosition(positions);
        return [journeyStartPosition];
      }),
      "unique_vehicle_id"
    );
  };

  selectJourney = (journey) => {
    const {Time, Filters, Journey, state} = this.props;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(journey.journey_start_time);
        Filters.setVehicle(journey.unique_vehicle_id);
      }
    }

    Journey.setSelectedJourney(journey);
  };

  onSelectJourney = (journey) => (e) => {
    e.preventDefault();
    this.selectJourney(journey);
  };

  onSelectVehicle = (vehicleId, firstJourney) => (e) => {
    e.preventDefault();
    const {
      Filters,
      Journey,
      Time,
      state: {vehicle, date, route},
    } = this.props;

    if (vehicleId) {
      Journey.requestJourneys({vehicleId, date, route});
    }

    if (vehicleId && vehicle !== vehicleId) {
      Filters.setVehicle(vehicleId);

      if (firstJourney) {
        Time.setTime(firstJourney.journey_start_time);
        Journey.setSelectedJourney(firstJourney);
      } else {
        Journey.setSelectedJourney(null);
      }
    }
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

  updateVehicleAndJourneySelection = (nextJourneyIndex) => {
    const {
      state: {selectedJourney, vehicle, date, route},
      positions,
      Journey,
    } = this.props;

    let useIndex = nextJourneyIndex;

    // Get a flattened array of journeys in the vehicle group order.
    // It's important that this is the same order as rendered.
    const journeys = flatten(Object.values(this.groupJourneysByVehicle(positions)));

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

    const vehicleGrouped = this.groupJourneysByVehicle(positions);

    const selectedJourneyId = getJourneyId(selectedJourney);
    // Keep track of the journey index independent of vehicle groups
    let journeyIndex = -1;

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
                      {vehicle}, {selectedJourney.journey_start_time}
                    </>
                  ) : (
                    vehicle
                  )}
                </NextPrevLabel>
              </PlusMinusInput>
            </HeaderRowLeft>
          </>
        }>
        {map(vehicleGrouped, (journeys, vehicleId) => {
          return (
            <JourneyListRow
              key={`vehicle_journey_row_${vehicleId}`}
              selected={vehicle === vehicleId}>
              <VehicleSelectButton
                onClick={this.onSelectVehicle(vehicleId, journeys[0])}>
                <VehicleIdHeading>{vehicleId}</VehicleIdHeading>
              </VehicleSelectButton>
              <JourneysRow>
                {journeys.map((journey) => {
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
                    <TagButton
                      key={`journey_row_${journeyId}`}
                      selected={journeyIsSelected}
                      onClick={this.onSelectJourney(journey)}>
                      <HeadsignSlot
                        color={get(transportColor, mode, "var(--light-grey)")}>
                        <TransportIcon mode={mode} />
                        {lineNumber}
                      </HeadsignSlot>
                      <TimeSlot>{journeyTime}</TimeSlot>
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
                    </TagButton>
                  );
                })}
              </JourneysRow>
            </JourneyListRow>
          );
        })}
      </SidepanelList>
    );
  }
}

export default VehicleJourneys;
