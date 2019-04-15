import React, {useCallback, useState, useEffect, useMemo} from "react";
import {observer, Observer} from "mobx-react-lite";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import SidepanelList from "./SidepanelList";
import {ColoredBackgroundSlot} from "../TagButton";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {expr} from "mobx-utils";
import {secondsToTimeObject} from "../../helpers/time";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import map from "lodash/map";
import {inject} from "../../helpers/inject";
import doubleDigit from "../../helpers/doubleDigit";
import {getDayTypeFromDate} from "../../helpers/getDayTypeFromDate";
import getWeek from "date-fns/get_iso_week";
import JourneysByWeekQuery from "../../queries/JourneysByWeekQuery";
import ButtonGroup from "../ButtonGroup";
import {TIMEZONE} from "../../constants";
import moment from "moment-timezone";
import {dayTypes} from "../../helpers/getDayTypeFromDate";
import Tooltip from "../Tooltip";
import getDelayType from "../../helpers/getDelayType";

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TableRow = styled.div`
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--alt-grey);
  flex-wrap: nowrap;
`;

const TableHeader = styled(TableRow)`
  font-weight: bold;
  border-bottom-width: 2px;
`;

const TableBody = styled.div``;

const TableCell = styled.div`
  width: 4.125rem;
  padding: 0.5rem 0.25rem;
  flex: 1 1 auto;
  text-align: center;
  border: 0;
  border-right: 1px solid var(--alt-grey);
  font-size: 0.75rem;
  background: ${({backgroundColor}) => backgroundColor};
  color: ${({color}) => color};

  &:last-child {
    border-right: 0;
  }
`;

const TableCellButton = styled(TableCell.withComponent("button"))`
  cursor: pointer;
  font-weight: bold;
`;

const decorate = flow(
  observer,
  inject("Journey", "Filters", "Time")
);

const orderByDayType = (departures) =>
  orderBy(departures, ({dayType}) => dayTypes.indexOf(dayType));

const JourneysByWeek = decorate(({state, Time, Journey}) => {
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

  const weekNumber = getWeek(date);
  const currentDayType = getDayTypeFromDate(date);

  const [selectedDayTypes, setSelectedDayTypes] = useState([]);

  const setWeekdays = useCallback(() => {
    setSelectedDayTypes(["Ma", "Ti", "Ke", "To", "Pe"]);
  }, []);

  const setSaturday = useCallback(() => {
    setSelectedDayTypes(["La"]);
  }, []);

  const setSunday = useCallback(() => {
    setSelectedDayTypes(["Su"]);
  }, []);

  useEffect(() => {
    if (currentDayType === "La") {
      setSaturday();
    } else if (currentDayType === "Su") {
      setSunday();
    } else {
      setWeekdays();
    }
  }, [currentDayType]);

  const selectedDates = useMemo(() => {
    const weekStart = moment.tz(date, TIMEZONE).startOf("isoWeek");
    const weekEnd = weekStart.clone().endOf("isoWeek");

    if (selectedDayTypes.includes("Su")) {
      return [weekEnd.format("D.M")];
    }

    if (selectedDayTypes.includes("La")) {
      return [weekEnd.subtract(1, "day").format("D.M")];
    }

    const dates = [];

    while (dates.length < 5) {
      dates.push(weekStart.format("D.M"));
      weekStart.add(1, "day");
    }

    return dates;
  }, [date, selectedDayTypes]);

  return (
    <JourneysByWeekQuery route={route} date={date}>
      {({departures, loading}) => (
        <Observer>
          {() => {
            const departuresByTime = groupBy(
              departures,
              "plannedDepartureTime.departureTime"
            );

            return (
              <SidepanelList
                loading={loading}
                header={
                  <ListHeader>
                    <div>
                      {route.routeId}, {route.direction} / Week {weekNumber}
                    </div>
                    <div>
                      <ButtonGroup
                        buttons={[
                          {
                            key: "MaPe",
                            label: "Ma-Pe",
                            onClick: setWeekdays,
                            active: selectedDayTypes.includes("Ma"),
                            helpText: "Select weekdays",
                          },
                          {
                            key: "La",
                            label: "La",
                            onClick: setSaturday,
                            active: selectedDayTypes.includes("La"),
                            helpText: "Select saturday",
                          },
                          {
                            key: "Su",
                            label: "Su",
                            onClick: setSunday,
                            active: selectedDayTypes.includes("Su"),
                            helpText: "Select sunday",
                          },
                        ]}
                      />
                    </div>
                  </ListHeader>
                }>
                {(scrollRef) => (
                  <>
                    <TableHeader>
                      <TableCell>Time</TableCell>
                      {selectedDates.map((day) => (
                        <TableCell key={`header_date_${day}`}>{day}</TableCell>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {map(departuresByTime, (departuresAtTime, departureTime) => {
                        const selectedDayDepartures = orderByDayType(
                          departuresAtTime.filter(({dayType}) =>
                            selectedDayTypes.includes(dayType)
                          )
                        );

                        if (selectedDayDepartures.length === 0) {
                          return null;
                        }

                        const weekDepartures = [];

                        let depIndex = 0;
                        while (weekDepartures.length < selectedDayTypes.length) {
                          const dep = selectedDayDepartures[depIndex] || null;
                          weekDepartures.push(dep);
                          depIndex++;
                        }

                        return (
                          <TableRow key={`departure_row_${departureTime}`}>
                            <TableCell>{departureTime.slice(0, -3)}</TableCell>
                            {weekDepartures.map((departure) => {
                              const dayType = get(departure, "dayType", departure);

                              const observedTime = get(
                                departure,
                                "observedDepartureTime",
                                null
                              );

                              if (!observedTime) {
                                return (
                                  <TableCell
                                    key={`departure_day_${dayType ||
                                      "no_day"}_${departureTime}`}>
                                    X
                                  </TableCell>
                                );
                              }

                              const journeyId = getJourneyId(departure.journey);

                              const journeyIsSelected = expr(
                                () => selectedJourneyId && selectedJourneyId === journeyId
                              );

                              const plannedObservedDiff =
                                departure.observedDepartureTime.departureTimeDifference;

                              const diffTime = secondsToTimeObject(plannedObservedDiff);
                              const delayType = getDelayType(plannedObservedDiff);

                              return (
                                <Tooltip
                                  helpText="Journey list diff"
                                  key={`departure_day_${
                                    departure.dayType
                                  }_${departureTime}`}>
                                  <TableCellButton
                                    onClick={() => selectJourney(departure.journey)}
                                    ref={journeyIsSelected ? scrollRef : null}
                                    color={getTimelinessColor(
                                      delayType,
                                      "var(--light-green)"
                                    )}
                                    backgroundColor={
                                      journeyIsSelected ? "var(--blue)" : "white"
                                    }>
                                    {plannedObservedDiff < 0 ? "-" : ""}
                                    {doubleDigit(diffTime.minutes)}:
                                    {doubleDigit(diffTime.seconds)}
                                  </TableCellButton>
                                </Tooltip>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </>
                )}
              </SidepanelList>
            );
          }}
        </Observer>
      )}
    </JourneysByWeekQuery>
  );
});

export default JourneysByWeek;
