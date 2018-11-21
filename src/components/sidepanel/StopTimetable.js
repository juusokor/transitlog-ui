import React, {Component} from "react";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import {observer} from "mobx-react";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import TimetableDeparture from "./TimetableDeparture";
import {sortByOperationDay} from "../../helpers/sortByOperationDay";
import FirstDepartureQuery from "../../queries/FirstDepartureQuery";
import {getDayTypeFromDate} from "../../helpers/getDayTypeFromDate";

const TimetableGrid = styled.div`
  margin-bottom: 1rem;
`;

const TimetableSection = styled.div`
  margin-bottom: 1.5rem;
`;

@observer
class StopTimetable extends Component {
  getFocusedDepartureTime = (departuresByHour, time) => {
    let scrollToHour = false;
    let scrollToMinute = false;

    const timeHour = time.split(":")[0];
    const timeMinute = parseInt(time.split(":")[1], 10);

    const selectedHourTimes = departuresByHour.find(
      ([hour]) => timeHour === hour.split(":")[0]
    );

    if (selectedHourTimes) {
      scrollToHour = parseInt(timeHour);

      const orderByMatchingTime = orderBy(selectedHourTimes[1], (departure) =>
        Math.abs(departure.minutes - timeMinute)
      );

      if (orderByMatchingTime.length !== 0) {
        scrollToMinute = get(orderByMatchingTime, "[0].minutes", false);
      }
    }

    return {hours: scrollToHour, minutes: scrollToMinute};
  };

  render() {
    const {
      routeFilter,
      timeRangeFilter,
      departures,
      groupedJourneys,
      date,
      selectedJourney,
      stop,
      onSelectAsJourney,
      focusRef,
      time,
      loading: allLoading,
    } = this.props;

    // Group into hours while making sure to separate pre-4:30 and post-4:30 departures
    const byHour = groupBy(departures, ({hours, minutes}) => {
      if (hours === 4 && minutes >= 30) {
        return `${doubleDigit(hours)}:30`;
      }

      return `${doubleDigit(hours)}:00`;
    });

    // Make sure that night departures from the same operation
    // day comes last in the timetable list.
    const byHourOrdered = orderBy(Object.entries(byHour), ([hour]) =>
      sortByOperationDay(hour)
    );

    // Figure out which time the list should be scrolled to.
    const focusedDepartureTime = this.getFocusedDepartureTime(byHourOrdered, time);
    const {min, max} = timeRangeFilter;

    const dayType = getDayTypeFromDate(date);

    // Create batches for the firstDeparture query.
    const batchedFirstDepartureRequests = departures.map(
      ({routeId, departureId, dateBegin, dateEnd, direction}) => ({
        routeId,
        departureId,
        dateBegin,
        dateEnd,
        direction,
      })
    );

    return (
      <FirstDepartureQuery
        skip={batchedFirstDepartureRequests.length === 0}
        queries={batchedFirstDepartureRequests}
        dayType={dayType}>
        {({firstDepartures, loading}) => (
          <TimetableGrid>
            {!allLoading && byHourOrdered.length === 0 && "No data"}

            {/* Loop through the hour-grouped departures */}
            {byHourOrdered.map(([hour, times]) => {
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
                    .startsWith(routeFilter)
                );
              }

              return (
                <TimetableSection key={`hour_${stop.stopId}_${hour}`}>
                  {timetableDepartures.map((departure) => {
                    let scrollToTime = false;

                    // Check if the list should be scrolled to the current element.
                    if (
                      focusedDepartureTime.hours === departure.hours &&
                      focusedDepartureTime.minutes === departure.minutes
                    ) {
                      scrollToTime = true;
                    }

                    const {departureId, dayType, routeId, direction} = departure;

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
                        `${firstDepartureTime}:${departure.routeId}:${
                          departure.direction
                        }`,
                        {}
                      );
                    }

                    return (
                      <TimetableDeparture
                        key={`departure_${departureId}_${routeId}_${direction}_${
                          stop.stopId
                        }_${dayType}_${departure.hours}:${departure.minutes}`}
                        focusRef={scrollToTime ? focusRef : null}
                        routeFilter={routeFilter}
                        timeRangeFilter={timeRangeFilter}
                        selectedJourney={selectedJourney}
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
          </TimetableGrid>
        )}
      </FirstDepartureQuery>
    );
  }
}

export default StopTimetable;
