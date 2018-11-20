import React, {Component} from "react";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import reduce from "lodash/reduce";
import get from "lodash/get";
import set from "lodash/set";
import map from "lodash/map";
import sortedIndexBy from "lodash/sortedIndexBy";
import {observer} from "mobx-react";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import TimetableDeparture from "./TimetableDeparture";
import {sortByOperationDay} from "../../helpers/sortByOperationDay";

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
      journeys,
      date,
      selectedJourney,
      stop,
      onSelectAsJourney,
      focusRef,
      time,
      loading,
    } = this.props;

    const journeysByRouteAndTime = {};

    for (let i = journeys.length - 1; i >= 0; i--) {
      const hfp = journeys[i];
      const routeKey = `${hfp.route_id}:${hfp.direction_id}`;
      const routeHfp = journeysByRouteAndTime[routeKey] || [];
      let existingHfpIndex = routeHfp.findIndex(
        (item) => item.journey_start_time === hfp.journey_start_time
      );

      if (existingHfpIndex !== -1) {
        const existingHfp = routeHfp[existingHfpIndex];

        if (hfp.received_at_unix > existingHfp.received_at_unix) {
          routeHfp.splice(existingHfpIndex, 1, hfp);
        }
      } else {
        const insertIndex = sortedIndexBy(routeHfp, hfp, "received_at_unix");
        routeHfp.splice(insertIndex, 0, hfp);
      }

      journeysByRouteAndTime[routeKey] = routeHfp;
    }

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

    const focusedDepartureTime = this.getFocusedDepartureTime(byHourOrdered, time);
    const {min, max} = timeRangeFilter;

    return (
      <TimetableGrid>
        {!loading && byHourOrdered.length === 0 && "No data"}

        {byHourOrdered.map(([hour, times], idx) => {
          let timetableDepartures = times;

          if (min !== "" || max !== "") {
            const intHour = parseInt(hour.replace(":", ""), 10) / 100;
            if (intHour < parseInt(min) || intHour > parseInt(max)) {
              return null;
            }
          }

          if (routeFilter) {
            timetableDepartures = times.filter((departure) =>
              get(departure, "routeId", "")
                .substring(1)
                .replace(/^0+/, "")
                .startsWith(routeFilter)
            );
          }

          return (
            <TimetableSection key={`hour_${hour}_${idx}`}>
              {timetableDepartures.map((departure, idx) => {
                let scrollToTime = false;

                if (
                  focusedDepartureTime.hours === departure.hours &&
                  focusedDepartureTime.minutes === departure.minutes
                ) {
                  scrollToTime = true;
                }

                const departureJourney = Object.values(
                  get(
                    journeysByRouteAndTime,
                    `${departure.routeId}:${departure.direction}`,
                    {}
                  )
                )[departure.departureId - 1];

                return (
                  <TimetableDeparture
                    focusRef={scrollToTime ? focusRef : null}
                    routeFilter={routeFilter}
                    timeRangeFilter={timeRangeFilter}
                    selectedJourney={selectedJourney}
                    key={`time_${idx}`}
                    onClick={onSelectAsJourney}
                    stop={stop}
                    date={date}
                    journey={departureJourney}
                    departure={departure}
                  />
                );
              })}
            </TimetableSection>
          );
        })}
      </TimetableGrid>
    );
  }
}

export default StopTimetable;
