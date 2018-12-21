import React, {Component} from "react";
import orderBy from "lodash/orderBy";
import flatMap from "lodash/flatMap";
import get from "lodash/get";
import {observer} from "mobx-react";
import styled from "styled-components";
import TimetableDeparture from "./TimetableDeparture";
import FirstDepartureQuery from "../../queries/FirstDepartureQuery";
import {getDayTypeFromDate} from "../../helpers/getDayTypeFromDate";
import getJourneyId from "../../helpers/getJourneyId";

const TimetableList = styled.div`
  margin-bottom: 1rem;
`;

const TimetableSection = styled.div`
  margin-bottom: 1.5rem;
`;

@observer
class StopTimetable extends Component {
  // Finds a departure that is closest to the given time and returns its hours and minutes.
  getDepartureTimeByTime = (departuresByHour, time) => {
    let selectedHour = false;
    let selectedMinute = false;

    const timeHour = time.split(":")[0];
    const timeMinute = parseInt(time.split(":")[1], 10);

    const selectedHourTimes = departuresByHour.find(
      ([hour]) => timeHour === hour.split(":")[0]
    );

    if (selectedHourTimes) {
      selectedHour = parseInt(timeHour);

      const orderByMatchingTime = orderBy(selectedHourTimes[1], (departure) =>
        Math.abs(departure.minutes - timeMinute)
      );

      if (orderByMatchingTime.length !== 0) {
        selectedMinute = get(orderByMatchingTime, "[0].minutes", false);
      }
    }

    return {hours: selectedHour, minutes: selectedMinute};
  };

  render() {
    const {
      routeFilter,
      timeRangeFilter,
      departuresByHour,
      departuresPerHour,
      groupedJourneys,
      date,
      selectedJourney,
      stop,
      onSelectAsJourney,
      focusRef,
      time,
      loading: allLoading,
    } = this.props;

    // Figure out which time the list should be scrolled to.
    const focusedDepartureTime = this.getDepartureTimeByTime(departuresByHour, time);

    let {min, max} = timeRangeFilter;

    const dayType = getDayTypeFromDate(date);

    // Create batches for the firstDeparture query.
    let batchedFirstDepartureRequests = flatMap(
      departuresByHour,
      // Map to whole departures. The query will pick what it needs.
      ([hour, departures]) => departures.map((dep) => dep)
    );

    // If there is min/max hour filters set, make sure no unnecessary first departures are fetched.
    if (min || max || routeFilter) {
      batchedFirstDepartureRequests = batchedFirstDepartureRequests.filter(
        ({hours, routeId}) => {
          if ((min && hours < parseInt(min)) || (max && hours > parseInt(max))) {
            return false;
          }

          if (routeFilter) {
            // Clean up the routeId to be compatible with what
            // the user will enter into the filter field.
            const routeIdFilterTerm = routeId
              .substring(1)
              .replace(/^0+/, "")
              .toLowerCase();

            if (!routeIdFilterTerm.startsWith(routeFilter.toLowerCase())) {
              return false;
            }
          }

          return true;
        }
      );
    }

    return (
      <FirstDepartureQuery
        skip={batchedFirstDepartureRequests.length === 0}
        queries={batchedFirstDepartureRequests}
        dayType={dayType}>
        {({firstDepartures, loading}) => (
          <TimetableList>
            {!allLoading && departuresByHour.length === 0 && "No data"}

            {/* Loop through the hour-grouped departures */}
            {departuresByHour.map(([hour, times]) => {
              let timetableDepartures = times;

              if (min !== "" || max !== "") {
                const intHour = parseInt(hour.replace(":", ""), 10) / 100;
                if (intHour < parseInt(min) || intHour > parseInt(max)) {
                  return null;
                }
              }

              // Filter the list by the route filter
              if (routeFilter) {
                timetableDepartures = times.filter((departure) =>
                  get(departure, "routeId", "")
                    .substring(1)
                    .replace(/^0+/, "")
                    .toLowerCase()
                    .startsWith(routeFilter.toLowerCase())
                );
              }

              return (
                <TimetableSection key={`hour_${stop.stopId}_${date}_${hour}`}>
                  {timetableDepartures.map((departure) => {
                    const {
                      departureId,
                      dayType,
                      routeId,
                      direction,
                      hours,
                      minutes,
                    } = departure;

                    let departureJourney = null;

                    // Find the scheduled time for the first stop in order
                    // to get the correct hfp item.
                    const firstDepartureTime = get(
                      firstDepartures,
                      `${departure.routeId}_${departure.direction}_${
                        departure.departureId
                      }`
                    );

                    // If we have the scheduled time from the first stop, we can
                    // find the correct hfp item.
                    if (firstDepartures && firstDepartureTime) {
                      departureJourney = get(
                        groupedJourneys,
                        `${date}:${firstDepartureTime}:${departure.routeId}:${
                          departure.direction
                        }`,
                        null
                      );
                    }

                    let scrollToTime = false;

                    const journeyIsSelected =
                      selectedJourney &&
                      departureJourney &&
                      getJourneyId(selectedJourney) ===
                        getJourneyId(departureJourney);

                    // Check if the list should be scrolled to the current element.
                    if (
                      journeyIsSelected ||
                      (focusedDepartureTime.hours === hours &&
                        focusedDepartureTime.minutes === minutes)
                    ) {
                      scrollToTime = true;
                    }

                    const timingStopDef = get(
                      stop,
                      "timingStopTypes.nodes",
                      []
                    ).find(
                      (segment) =>
                        segment.timingStopType !== 0 &&
                        segment.routeId === departure.routeId &&
                        segment.direction === departure.direction
                    );

                    return (
                      <TimetableDeparture
                        key={`departure_${departureId}_${routeId}_${direction}_${
                          stop.stopId
                        }_${dayType}_${departure.hours}:${departure.minutes}`}
                        focusRef={scrollToTime ? focusRef : null}
                        routeFilter={routeFilter}
                        timeRangeFilter={timeRangeFilter}
                        journeyIsSelected={journeyIsSelected}
                        isTimingStop={!!timingStopDef}
                        onClick={onSelectAsJourney}
                        stop={stop}
                        date={date}
                        journey={departureJourney}
                        departure={departure}
                        loading={allLoading || loading}
                      />
                    );
                  })}
                </TimetableSection>
              );
            })}
          </TimetableList>
        )}
      </FirstDepartureQuery>
    );
  }
}

export default StopTimetable;
