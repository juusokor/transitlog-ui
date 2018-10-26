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
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import {transportIcon, transportColor, TransportIcon} from "../transportModes";
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
  font-weight: bold;
`;

const VehicleIdHeading = styled(Heading).attrs({level: 4})`
  width: 100%;
  margin: 0;
  padding: 0 0.75rem 1rem;
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

@inject(app("Filters", "Journey", "Time"))
@observer
class VehicleJourneys extends Component {
  selectJourney = (journey) => (e) => {
    e.preventDefault();
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

  onSelectVehicle = (vehicleId, firstJourney) => {
    return (e) => {
      const {Filters, Journey, Time, state} = this.props;

      if (vehicleId && state.vehicle !== vehicleId) {
        Filters.setVehicle(vehicleId);

        if (firstJourney) {
          Time.setTime(firstJourney.journey_start_time);
          Journey.setSelectedJourney(firstJourney);
        } else {
          Journey.setSelectedJourney(null);
        }
      }
    };
  };

  render() {
    const {
      positions = [],
      loading,
      state: {selectedJourney, date, vehicle},
    } = this.props;

    const vehicleGrouped = groupBy(
      flatMap(positions, ({positions}) => uniqBy(positions, "journey_start_time")),
      "unique_vehicle_id"
    );

    const selectedJourneyId = getJourneyId(selectedJourney);

    return (
      <SidepanelList
        loading={loading}
        header={
          <>
            <HeaderRowLeft>
              <Text>Vehicle</Text>
            </HeaderRowLeft>
            <span>
              <Text>Journeys</Text>
            </span>
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

                  return (
                    <TagButton
                      key={`journey_row_${journeyId}`}
                      selected={journeyIsSelected}
                      onClick={this.selectJourney(journey)}>
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
