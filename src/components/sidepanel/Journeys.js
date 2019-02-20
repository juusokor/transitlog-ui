import React, {Component} from "react";
import {observer, inject, Observer} from "mobx-react";
import get from "lodash/get";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import doubleDigit from "../../helpers/doubleDigit";
import Loading from "../Loading";
import SidepanelList from "./SidepanelList";
import {createRouteId} from "../../helpers/keys";
import {ColoredBackgroundSlot} from "../TagButton";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {expr} from "mobx-utils";
import RouteJourneys, {journeyHfpStates} from "../RouteJourneys";
import {getNormalTime} from "../../helpers/time";
import Tooltip from "../Tooltip";
import {applyTooltip} from "../../hooks/useTooltip";

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
  min-width: 1.5rem;
  text-align: center;
  display: inline-block;
  color: var(--dark-grey);
`;

@inject(app("Journey", "Time", "Filters"))
@observer
class Journeys extends Component {
  selectJourney = (journeyOrTime, instance = 0) => (e) => {
    e.preventDefault();
    const {Time, Journey, state} = this.props;
    let journeyToSelect = null;

    if (journeyOrTime) {
      const journey =
        typeof journeyOrTime === "string"
          ? Journey.createCompositeJourney(
              state.date,
              state.route,
              journeyOrTime,
              instance
            )
          : journeyOrTime;

      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(journey.journey_start_time);
        journeyToSelect = journey;
      }
    }
    Journey.setSelectedJourney(journeyToSelect);
  };

  render() {
    const {state} = this.props;
    const {date, route} = state;

    const selectedJourneyId = expr(() => getJourneyId(state.selectedJourney));

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
      <RouteJourneys>
        {({journeys, loading}) => (
          <Observer>
            {() => {
              focusedJourney = expr(() => {
                if (focusedJourney) {
                  return focusedJourney;
                }

                const time = parseInt(state.time.replace(":", "").slice(0, 4));
                let closestDeparture = null;
                let prevDiff = -1;

                for (const departure of journeys) {
                  const departureTime = get(departure, "time", "");

                  if (!departureTime) {
                    continue;
                  }

                  const departureTimeNum = parseInt(
                    departureTime.replace(":", "").slice(0, 4)
                  );
                  const diff = Math.abs(departureTimeNum - time);

                  if (prevDiff === -1 || diff < prevDiff) {
                    prevDiff = diff;
                    closestDeparture = departure;
                  }
                }

                return closestDeparture
                  ? get(closestDeparture, "journeyId", null)
                  : null;
              });

              return (
                <SidepanelList
                  reset={!focusedJourney || journeys.length === 0}
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
                    journeys.map((journey) => {
                      if (!journey.events || typeof journey.events === "string") {
                        const journeyId = journey.journeyId;

                        const journeyIsSelected = expr(
                          () =>
                            state.selectedJourney &&
                            selectedJourneyId === journeyId[0]
                        );

                        const journeyIsFocused =
                          focusedJourney && focusedJourney === journeyId;

                        let fetchStatus = journey.events;

                        return (
                          <JourneyListRow
                            ref={journeyIsFocused ? scrollRef : null}
                            key={`planned_journey_row_${journeyId}`}
                            selected={journeyIsSelected}
                            onClick={this.selectJourney(journey.time)}>
                            <Tooltip helpText="Planned journey time">
                              <JourneyRowLeft>
                                {getNormalTime(journey.time)}
                              </JourneyRowLeft>
                            </Tooltip>
                            {fetchStatus === journeyHfpStates.NOT_FOUND ? (
                              <Tooltip helpText="Journey no data">
                                <span>{text("filterpanel.journey.no_data")}</span>
                              </Tooltip>
                            ) : fetchStatus === journeyHfpStates.LOADING ? (
                              <Loading inline />
                            ) : (
                              <span>
                                {text("filterpanel.journey.click_to_fetch")}
                              </span>
                            )}
                          </JourneyListRow>
                        );
                      }

                      const journeyEvents = get(journey, "events", []);

                      if (journeyEvents.length === 0) {
                        return null;
                      }

                      return journeyEvents.map(
                        (journeyEvent, eventIndex, {length: eventsLength}) => {
                          const journeyId = getJourneyId(journeyEvent);

                          let observedJourney = (
                            <Text>filterpanel.journey.incomplete_data</Text>
                          );

                          const journeyIsSelected = expr(
                            () =>
                              state.selectedJourney &&
                              journeyId.includes(selectedJourneyId)
                          );

                          if (journeyEvents.length !== 0) {
                            const plannedObservedDiff = diffDepartureJourney(
                              journeyEvent,
                              journey.departure,
                              date
                            );

                            const observedTimeString = plannedObservedDiff
                              ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
                              : "";

                            const delayType = plannedObservedDiff
                              ? getDelayType(plannedObservedDiff.diff)
                              : "none";

                            observedJourney = (
                              <>
                                <Tooltip helpText="Journey list diff">
                                  <DelaySlot
                                    adjustLeft={eventsLength > 1}
                                    color={
                                      delayType === "late"
                                        ? "var(--dark-grey)"
                                        : "white"
                                    }
                                    backgroundColor={getTimelinessColor(
                                      delayType,
                                      "var(--light-green)"
                                    )}>
                                    {plannedObservedDiff.sign === "-" ? "-" : ""}
                                    {plannedObservedDiff.hours
                                      ? doubleDigit(plannedObservedDiff.hours) + ":"
                                      : ""}
                                    {doubleDigit(plannedObservedDiff.minutes)}:
                                    {doubleDigit(plannedObservedDiff.seconds)}
                                  </DelaySlot>
                                </Tooltip>
                                <Tooltip helpText="Journey list observed">
                                  <TimeSlot>{observedTimeString}</TimeSlot>
                                </Tooltip>
                              </>
                            );
                          }

                          const journeyIsFocused =
                            focusedJourney && journeyId.includes(focusedJourney);

                          return (
                            <JourneyListRow
                              {...applyTooltip("Journey list row")}
                              ref={journeyIsFocused ? scrollRef : null}
                              selected={journeyIsSelected}
                              key={`journey_row_${journeyId}`}
                              onClick={this.selectJourney(journeyEvent)}>
                              <JourneyRowLeft
                                {...applyTooltip("Planned journey time with data")}>
                                {getNormalTime(
                                  get(journeyEvent, "journey_start_time", "")
                                )}
                                {eventsLength > 1 && (
                                  <JourneyInstanceDisplay
                                    {...applyTooltip("Journey instance")}>
                                    {eventIndex + 1}
                                  </JourneyInstanceDisplay>
                                )}
                              </JourneyRowLeft>
                              {observedJourney}
                            </JourneyListRow>
                          );
                        }
                      );
                    })
                  }
                </SidepanelList>
              );
            }}
          </Observer>
        )}
      </RouteJourneys>
    );
  }
}

export default Journeys;
