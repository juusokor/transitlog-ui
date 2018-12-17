import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import map from "lodash/map";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {timeToFormat} from "../../helpers/time";
import {Text, text} from "../../helpers/text";
import withDepartures from "../../hoc/withRouteStopDepartures";
import doubleDigit from "../../helpers/doubleDigit";
import {observable, action, toJS} from "mobx";
import Loading from "../Loading";
import SidepanelList from "./SidepanelList";
import {journeyFetchStates} from "../../stores/JourneyStore";
import {createFetchKey} from "../../helpers/keys";
import {centerSort} from "../../helpers/centerSort";
import {departuresToTimes} from "../../helpers/departuresToTimes";
import {findJourneyStartPosition} from "../../helpers/findJourneyStartPosition";
import {ColoredBackgroundSlot} from "../TagButton";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import {sortByOperationDay} from "../../helpers/sortByOperationDay";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {expr} from "mobx-utils";

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) =>
    selected ? "var(--blue)" : "rgba(0, 0, 0, 0.025)"};
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
      selected ? "var(--blue)" : "rgba(255, 255, 255, 0.025)"};
  }
`;

const JourneyRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 6rem;
  text-align: left;
`;

const DelaySlot = styled(ColoredBackgroundSlot)`
  font-size: 0.875rem;
  margin: -2.5px 0;
  transform: none;
  padding: 5px;
  line-height: 1;
`;

const TimeSlot = styled.span`
  font-size: 0.857rem;
  font-family: "Courier New", Courier, monospace;
  min-width: 5rem;
  text-align: right;
`;

@inject(app("Journey", "Time", "Filters"))
@withDepartures
@observer
class Journeys extends Component {
  currentFetchKey = "";

  componentDidUpdate() {
    this.fetchAllJourneys();
  }

  fetchAllJourneys = () => {
    const {
      Journey,
      departures,
      state: {date, route, time, selectedJourney},
    } = this.props;

    // Create fetchKey key without time
    const fetchKey = createFetchKey(route, date, true);

    if (fetchKey && fetchKey !== this.currentFetchKey) {
      // Format to an array of string times, like 12:30:00
      let fetchTimes = departuresToTimes(departures);

      if (fetchTimes.length !== 0) {
        // Find which time we want to fetch first.
        let firstTime = selectedJourney ? selectedJourney.journey_start_time : time;
        fetchTimes = centerSort(firstTime, fetchTimes).slice(0, 5);

        const journeyRequests = fetchTimes.map((time) => ({
          time,
          route: toJS(route),
          date,
        }));

        Journey.requestJourneys(journeyRequests);
        this.currentFetchKey = fetchKey;
      }
    }
  };

  selectJourney = (journeyOrTime) => (e) => {
    e.preventDefault();
    const {departures, Time, Journey, state} = this.props;
    let journeyToSelect = null;

    if (journeyOrTime) {
      const journey =
        typeof journeyOrTime === "string"
          ? Journey.createCompositeJourney(state.date, state.route, journeyOrTime)
          : journeyOrTime.observed;

      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(
          timeToFormat(
            journey.journey_start_timestamp,
            "HH:mm:ss",
            "Europe/Helsinki"
          )
        );

        journeyToSelect = journey;

        const fetchTimes = centerSort(
          journey.journey_start_time,
          departuresToTimes(departures)
        ).slice(0, 5);

        const journeyRequests = fetchTimes.map((time) => ({
          time,
          route: {routeId: journey.route_id, direction: journey.direction_id},
          date: journey.oday,
        }));

        if (fetchTimes.length !== 0) {
          Journey.requestJourneys(journeyRequests);
        }
      }
    }

    Journey.setSelectedJourney(journeyToSelect);
  };

  render() {
    const {positions, loading, state, departures, Journey} = this.props;
    const {resolvedJourneyStates, date, route} = state;

    const journeys = map(positions, ({positions}) => positions[0]);
    const selectedJourneyId = expr(() => getJourneyId(state.selectedJourney));

    const plannedDepartures = departures.reduce((planned, departure) => {
      const timeStr = `${doubleDigit(departure.hours)}:${doubleDigit(
        departure.minutes
      )}:00`;

      if (journeys.some((j) => j.journey_start_time === timeStr)) {
        return planned;
      }

      planned[timeStr] = departure;
      return planned;
    }, {});

    const departureList = sortBy(
      [...journeys, ...Object.keys(plannedDepartures)],
      (value) => {
        const sortByTime =
          typeof value === "string" ? value : get(value, "journey_start_time");

        return sortByOperationDay(sortByTime);
      }
    );

    let focusedJourney = expr(() => {
      if (selectedJourneyId) {
        return selectedJourneyId;
      }

      const time = parseInt(state.time.replace(":", ""));
      let closestDeparture = "";
      let prevDiff = -1;

      for (const departure of departureList) {
        const departureTime = get(departure, "journey_start_time", departure);
        const departureTimeNum = parseInt(departureTime.replace(":", ""));
        const diff = Math.abs(departureTimeNum - time);

        if (prevDiff === -1 || diff < prevDiff) {
          prevDiff = diff;
          closestDeparture = departureTime;
        }
      }

      return closestDeparture
        ? getJourneyId(Journey.createCompositeJourney(date, route, closestDeparture))
        : null;
    });

    return (
      <SidepanelList
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
          departureList.map((journeyOrDeparture, index) => {
            if (typeof journeyOrDeparture === "string") {
              const journeyId = getJourneyId(
                Journey.createCompositeJourney(date, route, journeyOrDeparture)
              );

              let fetchStatus = resolvedJourneyStates.get(journeyId);

              return (
                <JourneyListRow
                  ref={journeyIsFocused ? scrollRef : null}
                  key={`planned_journey_row_${journeyOrDeparture}_${index}`}
                  selected={journeyIsSelected}
                  onClick={this.selectJourney(journeyOrDeparture)}>
                  <JourneyRowLeft>{journeyOrDeparture}</JourneyRowLeft>
                  {fetchStatus === journeyFetchStates.NOTFOUND ? (
                    <span>{text("filterpanel.journey.no_data")}</span>
                  ) : fetchStatus === journeyFetchStates.PENDING ? (
                    <Loading inline />
                  ) : (
                    <span>{text("filterpanel.journey.click_to_fetch")}</span>
                  )}
                </JourneyListRow>
              );
            }

            const journeyId = getJourneyId(journeyOrDeparture);

            const journeyPositions = get(
              positions.find(({journeyId: jid}) => jid === journeyId),
              "positions",
              []
            );

            const journeyStartPosition = findJourneyStartPosition(journeyPositions);

            const [hours, minutes] = journeyStartPosition.journey_start_time.split(
              ":"
            );

            const departure = {
              hours: parseInt(hours, 10),
              minutes: parseInt(minutes, 10),
            };

            const plannedObservedDiff = diffDepartureJourney(
              journeyStartPosition,
              departure,
              date
            );

            const observedTimeString = plannedObservedDiff
              ? plannedObservedDiff.observedMoment.format("HH:mm:ss")
              : "";

            const delayType = plannedObservedDiff
              ? getDelayType(plannedObservedDiff.diff)
              : "none";

            const journeyIsSelected = expr(
              () => state.selectedJourney && selectedJourneyId === journeyId
            );

            const journeyIsFocused = focusedJourney && focusedJourney === journeyId;

            return (
              <JourneyListRow
                ref={journeyIsFocused ? scrollRef : null}
                selected={journeyIsSelected}
                key={`journey_row_${getJourneyId(journeyOrDeparture)}`}
                onClick={this.selectJourney(journeyOrDeparture)}>
                <JourneyRowLeft>
                  {timeToFormat(
                    journeyOrDeparture.journey_start_timestamp,
                    "HH:mm:ss",
                    "Europe/Helsinki"
                  )}
                </JourneyRowLeft>
                {journeyStartPosition && (
                  <>
                    <DelaySlot
                      color={delayType === "late" ? "var(--dark-grey)" : "white"}
                      backgroundColor={getTimelinessColor(
                        delayType,
                        "var(--light-green)"
                      )}>
                      {plannedObservedDiff.sign}
                      {doubleDigit(plannedObservedDiff.minutes)}:
                      {doubleDigit(plannedObservedDiff.seconds)}
                    </DelaySlot>
                    <TimeSlot>{observedTimeString}</TimeSlot>
                  </>
                )}
              </JourneyListRow>
            );
          })
        }
      </SidepanelList>
    );
  }
}

export default Journeys;
