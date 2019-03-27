import React, {useCallback} from "react";
import {observer, Observer} from "mobx-react-lite";
import get from "lodash/get";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import SidepanelList from "./SidepanelList";
import {createRouteId} from "../../helpers/keys";
import {ColoredBackgroundSlot} from "../TagButton";
import getDelayType from "../../helpers/getDelayType";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {expr} from "mobx-utils";
import {getNormalTime, timeToSeconds, secondsToTimeObject} from "../../helpers/time";
import Tooltip from "../Tooltip";
import {applyTooltip} from "../../hooks/useTooltip";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import JourneysByDateQuery from "../../queries/JourneysByDateQuery";
import {createCompositeJourney} from "../../stores/journeyActions";
import doubleDigit from "../../helpers/doubleDigit";

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) => (selected ? "var(--blue)" : "transparent")};
  padding: 0.75rem 1rem;
  border: 0;
  max-width: none;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  color: ${({selected = false}) => (selected ? "white" : "var(--grey)")};
  outline: none;

  &:nth-child(odd) {
    background: ${({selected = false}) =>
      selected ? "var(--blue)" : "rgba(0, 0, 0, 0.03)"};
  }
`;

const JourneyRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 9.25rem;
  text-align: left;
`;

const DelaySlot = styled(ColoredBackgroundSlot)`
  font-size: 0.875rem;
  margin: -2.5px auto -2.5px 0;
  transform: none;
  padding: 5px;
  line-height: 1;
`;

const TimeSlot = styled.span`
  font-size: 0.857rem;
  font-family: "Courier New", Courier, monospace;
  min-width: 4.5rem;
  text-align: right;
`;

const JourneyInstanceDisplay = styled.span`
  margin-left: 0.5rem;
  padding: 2px 4px;
  border-radius: 2px;
  background: var(--lighter-grey);
  min-width: 1.1rem;
  font-size: 0.75rem;
  text-align: center;
  display: inline-block;
  color: var(--dark-grey);
`;

const decorate = flow(
  observer,
  inject("Journey", "Filters", "Time")
);

const Journeys = decorate(({state, Time, Journey}) => {
  const selectJourney = useCallback((journey) => {
    let journeyToSelect = null;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(journey.departureTime);
        journeyToSelect = journey;
      }
    }

    Journey.setSelectedJourney(journeyToSelect);
  }, []);

  const {date, route} = state;
  const selectedJourneyId = getJourneyId(state.selectedJourney);

  let focusedJourney = expr(() => {
    // Make sure that the selected journey belongs to the currently selected route.
    if (
      selectedJourneyId &&
      state.selectedJourney &&
      createRouteId(state.selectedJourney) === createRouteId(route)
    ) {
      return selectedJourneyId;
    }

    return null;
  });

  return (
    <JourneysByDateQuery route={route} date={date}>
      {({departures, loading}) => (
        <Observer>
          {() => {
            focusedJourney = expr(() => {
              if (focusedJourney) {
                return focusedJourney;
              }

              const time = timeToSeconds(state.time);
              let closestDeparture = null;
              let prevDiff = -1;

              for (const departure of departures) {
                const departureTime = get(
                  departure,
                  "plannedDepartureTime.departureTime",
                  ""
                );

                if (!departureTime) {
                  continue;
                }

                const departureTimeNum = timeToSeconds(departureTime);
                const diff = Math.abs(departureTimeNum - time);

                if (prevDiff === -1 || diff < prevDiff) {
                  prevDiff = diff;
                  closestDeparture = departure;
                }
              }

              if (closestDeparture) {
                const compositeJourney = createCompositeJourney(
                  closestDeparture.plannedDepartureTime.departureDate,
                  closestDeparture,
                  closestDeparture.plannedDepartureTime.departureTime
                );

                return getJourneyId(compositeJourney, false);
              }

              return null;
            });

            return (
              <SidepanelList
                reset={!focusedJourney || departures.length === 0}
                loading={loading}
                header={
                  <>
                    <JourneyRowLeft>
                      <Text>filterpanel.planned_start_time</Text>
                    </JourneyRowLeft>
                    <span>
                      <Text>filterpanel.real_start_time</Text>
                    </span>
                  </>
                }>
                {(scrollRef) =>
                  departures.map((departure) => {
                    const departureDate = departure.plannedDepartureTime.departureDate;
                    const departureTime = departure.plannedDepartureTime.departureTime;

                    if (!departure.journey) {
                      const compositeJourney = createCompositeJourney(
                        departureDate,
                        departure,
                        departureTime
                      );

                      const journeyId = getJourneyId(compositeJourney, false);

                      const journeyIsSelected = expr(
                        () =>
                          state.selectedJourney &&
                          getJourneyId(selectedJourneyId, false) === journeyId
                      );

                      const journeyIsFocused =
                        focusedJourney &&
                        getJourneyId(focusedJourney, false) === journeyId;

                      return (
                        <JourneyListRow
                          ref={journeyIsFocused ? scrollRef : null}
                          key={`planned_journey_row_${journeyId}`}
                          selected={journeyIsSelected}
                          onClick={() => selectJourney(compositeJourney)}>
                          <Tooltip helpText="Planned journey time">
                            <JourneyRowLeft>
                              {getNormalTime(departureTime).slice(0, -3)}
                            </JourneyRowLeft>
                          </Tooltip>
                          <Tooltip helpText="Journey no data">
                            <span>{text("filterpanel.journey.no_data")}</span>
                          </Tooltip>
                        </JourneyListRow>
                      );
                    }

                    const journeyId = getJourneyId(departure.journey);

                    const journeyIsSelected = expr(
                      () => selectedJourneyId && selectedJourneyId === journeyId
                    );

                    const plannedObservedDiff =
                      departure.observedDepartureTime.departureTimeDifference;

                    const observedTimeString =
                      departure.observedDepartureTime.departureTime;

                    const diffTime = secondsToTimeObject(plannedObservedDiff);
                    const delayType = getDelayType(plannedObservedDiff);
                    const multipleInstances = departure.journey._numInstance !== 0;

                    const observedJourney = (
                      <>
                        <Tooltip helpText="Journey list diff">
                          <DelaySlot
                            color={delayType === "late" ? "var(--dark-grey)" : "white"}
                            backgroundColor={getTimelinessColor(
                              delayType,
                              "var(--light-green)"
                            )}>
                            {plannedObservedDiff < 0 ? "-" : ""}
                            {diffTime.hours ? doubleDigit(diffTime.hours) + ":" : ""}
                            {doubleDigit(diffTime.minutes)}:
                            {doubleDigit(diffTime.seconds)}
                          </DelaySlot>
                        </Tooltip>
                        <Tooltip helpText="Journey list observed">
                          <TimeSlot>{observedTimeString}</TimeSlot>
                        </Tooltip>
                      </>
                    );

                    // The focused journey is used for scrolling and comparing
                    // instances is problematic, so strip the instance char
                    // from both sides of the comparison.
                    const journeyIsFocused =
                      focusedJourney &&
                      focusedJourney.slice(0, -1) === journeyId.slice(0, -1);

                    return (
                      <JourneyListRow
                        {...applyTooltip("Journey list row")}
                        ref={journeyIsFocused ? scrollRef : null}
                        selected={journeyIsSelected}
                        key={`journey_row_${journeyId}_${departure.id}`}
                        onClick={() => selectJourney(departure.journey)}>
                        <JourneyRowLeft
                          {...applyTooltip("Planned journey time with data")}>
                          {getNormalTime(departureTime).slice(0, -3)}
                          {multipleInstances && (
                            <JourneyInstanceDisplay {...applyTooltip("Journey instance")}>
                              {departure.journey._numInstance}
                            </JourneyInstanceDisplay>
                          )}
                        </JourneyRowLeft>
                        {observedJourney}
                      </JourneyListRow>
                    );
                  })
                }
              </SidepanelList>
            );
          }}
        </Observer>
      )}
    </JourneysByDateQuery>
  );
});

export default Journeys;
