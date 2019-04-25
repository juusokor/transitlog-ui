import React, {useCallback, useState, useEffect, useMemo} from "react";
import {observer, Observer} from "mobx-react-lite";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import SidepanelList from "./SidepanelList";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import {secondsToTimeObject} from "../../helpers/time";
import flow from "lodash/flow";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import map from "lodash/map";
import {inject} from "../../helpers/inject";
import doubleDigit from "../../helpers/doubleDigit";
import {getDayTypeFromDate, dayTypes} from "../../helpers/getDayTypeFromDate";
import getWeek from "date-fns/get_iso_week";
import format from "date-fns/format";
import JourneysByWeekQuery from "../../queries/JourneysByWeekQuery";
import ButtonGroup from "../ButtonGroup";
import {TIMEZONE} from "../../constants";
import moment from "moment-timezone";
import Tooltip from "../Tooltip";
import getDelayType from "../../helpers/getDelayType";
import {createCompositeJourney} from "../../stores/journeyActions";
import {text, Text} from "../../helpers/text";
import {TransportIcon} from "../transportModes";
import Waiting from "../../icons/Waiting";
import SomethingWrong from "../../icons/SomethingWrong";
import Cross from "../../icons/Cross";
/*import {weeklyObservedTimeTypes} from "../../stores/UIStore";
import ToggleButton from "../ToggleButton";*/

const ListHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListHeading = styled.div`
  display: flex;
  text-transform: capitalize;
  justify-content: space-between;
  padding: 0.25rem 0 0.75rem;

  h4 {
    margin: 0;
  }
`;

const ListWrapper = styled.div``;

const RouteHeading = styled.div`
  display: flex;

  svg {
    margin-right: 0.5rem;
  }
`;

const TableRow = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--lightest-grey);
  flex-wrap: nowrap;
  background-color: ${({isSelected = false}) => (isSelected ? "#f6fcff" : "white")};
`;

const TableBody = styled.div`
  padding-top: 2rem;
`;

const TableCell = styled.div`
  width: 4.125rem;
  padding: 0.5rem 0.25rem;
  flex: 1 1 auto;
  text-align: center;
  border: 0;
  border-right: 1px solid var(--lightest-grey);
  font-size: 0.875rem;
  font-weight: ${({strong = false}) => (strong ? "bold" : "normal")};
  background: ${({backgroundColor = "transparent", highlight = false}) =>
    (!backgroundColor || backgroundColor === "transparent") && highlight
      ? "#f6fcff"
      : backgroundColor};
  color: ${({color}) => color};

  &:last-child {
    border-right: 0;
  }
`;

const TableCellButton = styled(TableCell.withComponent("button"))`
  cursor: pointer;
  font-weight: bold;
  display: block;
  font-family: inherit;
  outline: 0;
`;

const TableHeader = styled(TableRow)`
  font-weight: bold;
  border-bottom-width: 1px;
  border-color: var(--alt-grey);

  ${TableCell} {
    border-color: var(--alt-grey);
  }
`;

/*const TimeTypeButton = styled(ToggleButton)`
  padding: 0 0.75rem 0;
  margin-top: -0.25rem;
`;*/

const decorate = flow(
  observer,
  inject("UI", "Journey", "Filters", "Time")
);

const JourneysByWeek = decorate(({state, Time, Filters, Journey, UI}) => {
  const selectJourney = useCallback((journey) => {
    let journeyToSelect = null;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Time.setTime(journey.departureTime);
        Filters.setDate(journey.departureDate);
        journeyToSelect = journey;
      }
    }

    Journey.setSelectedJourney(journeyToSelect);
  }, []);

  // TODO: Implement arrival / depart toggle when we have HFP 2 data

  /*const onChangeObservedTimeType = useCallback((e) => {
    const value = e.target.value;

    UI.setWeeklyObservedTimesType(
      value === weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
        ? weeklyObservedTimeTypes.LAST_STOP_ARRIVAL
        : weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
    );
  }, []);*/

  const {date, route} = state;
  const selectedJourneyId = getJourneyId(state.selectedJourney);

  const weekNumber = getWeek(date);
  const currentDayType = getDayTypeFromDate(date);

  const [selectedDayTypes, setSelectedDayTypes] = useState([]);
  const currentDayTypeIndex = selectedDayTypes.indexOf(currentDayType);

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

  const weekStartDate = useMemo(
    () =>
      moment
        .tz(date, TIMEZONE)
        .startOf("isoWeek")
        .format("YYYY-MM-DD"),
    [date]
  );

  const selectedDates = useMemo(() => {
    const weekStart = moment.tz(weekStartDate, TIMEZONE);
    const weekEnd = weekStart.clone().endOf("isoWeek");

    if (selectedDayTypes.includes("Su")) {
      return [weekEnd.format("YYYY-MM-DD")];
    }

    if (selectedDayTypes.includes("La")) {
      return [weekEnd.subtract(1, "day").format("YYYY-MM-DD")];
    }

    const dates = [];

    while (dates.length < 5) {
      dates.push(weekStart.format("YYYY-MM-DD"));
      weekStart.add(1, "day");
    }

    return dates;
  }, [weekStartDate, selectedDayTypes]);

  return (
    <JourneysByWeekQuery route={route} date={weekStartDate}>
      {({departures, loading}) => (
        <Observer>
          {() => {
            const departuresByTime = groupBy(
              departures.filter(({plannedDepartureTime}) =>
                selectedDates.includes(plannedDepartureTime.departureDate)
              ),
              "plannedDepartureTime.departureTime"
            );

            const mode = get(departures, "[0].mode", "BUS");

            return (
              <SidepanelList
                focusKey={selectedJourneyId}
                loading={loading}
                floatingListHeader={
                  <TableHeader>
                    <TableCell>Time</TableCell>
                    {selectedDates.map((day, idx) => (
                      <TableCell
                        highlight={idx === currentDayTypeIndex}
                        key={`header_date_${day}`}>
                        {format(day, "D.M")}
                      </TableCell>
                    ))}
                  </TableHeader>
                }
                header={
                  <ListHeader>
                    <ListHeading>
                      <RouteHeading>
                        <TransportIcon width={23} height={23} mode={mode} />
                        <h4>
                          {route.routeId} / {route.direction}{" "}
                        </h4>
                      </RouteHeading>
                      {/*<TimeTypeButton
                        type="checkbox"
                        onChange={onChangeObservedTimeType}
                        name="observed_times_type"
                        isSwitch={true}
                        preLabel={text("map.stops.arrive")}
                        label={text("map.stops.depart")}
                        checked={
                          weeklyObservedTimes ===
                          weeklyObservedTimeTypes.LAST_STOP_ARRIVAL
                        }
                        value={weeklyObservedTimes}
                      />*/}
                      <div>
                        <Text>general.week</Text> {weekNumber}
                      </div>
                    </ListHeading>
                    <div>
                      <ButtonGroup
                        buttons={[
                          {
                            key: "MaPe",
                            label: text("general.weekdays"),
                            onClick: setWeekdays,
                            active: selectedDayTypes.includes("Ma"),
                            helpText: "Select weekdays",
                          },
                          {
                            key: "La",
                            label: text("general.saturday"),
                            onClick: setSaturday,
                            active: selectedDayTypes.includes("La"),
                            helpText: "Select saturday",
                          },
                          {
                            key: "Su",
                            label: text("general.sunday"),
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
                  <ListWrapper>
                    <TableBody>
                      {map(departuresByTime, (departuresAtTime, departureTime) => {
                        const selectedDayDepartures = orderBy(
                          departuresAtTime,
                          "plannedDepartureTime.departureDate"
                        );

                        if (selectedDayDepartures.length === 0) {
                          return null;
                        }

                        const weekDepartures = [];

                        let rowIsSelected = false;
                        let colIndex = 0;

                        while (weekDepartures.length < selectedDates.length) {
                          // The day type that we want to find a departure for
                          const date = selectedDates[colIndex];

                          const dep =
                            selectedDayDepartures.find(
                              (dep) => dep.plannedDepartureTime.departureDate === date
                            ) || null;

                          // Check if the row contains a selected departure
                          if (dep) {
                            const compositeJourney = createCompositeJourney(
                              dep.plannedDepartureTime.departureDate,
                              dep,
                              departureTime
                            );

                            const journeyId = getJourneyId(compositeJourney, false);

                            if (
                              selectedJourneyId &&
                              getJourneyId(selectedJourneyId, false) === journeyId
                            ) {
                              rowIsSelected = true;
                            }
                          }

                          weekDepartures.push(dep);
                          colIndex++;
                        }

                        return (
                          <TableRow
                            key={`departure_row_${departureTime}`}
                            isSelected={rowIsSelected}
                            ref={rowIsSelected ? scrollRef : null}>
                            <TableCell strong={true}>
                              {departureTime.slice(0, -3)}
                            </TableCell>
                            {weekDepartures.map((departure, idx) => {
                              const dayType = get(departure, "dayType", "unknown");

                              const observedTime = get(
                                departure,
                                "observedDepartureTime",
                                null
                              );

                              // The departure is unavailable for some reason
                              let departureStatus = "notavailable";

                              // Find out the status of the departure
                              if (departure && observedTime) {
                                // We have a planned departure and observed times
                                departureStatus = "ok";
                              } else if (departure && !observedTime) {
                                // We have a departure but no observed time, yet.
                                departureStatus = "notobserved";
                              } else if (
                                !departure &&
                                weekDepartures.some((dep) => !!dep)
                              ) {
                                // We don't have a departure, but there are other departures this week for this time.
                                departureStatus = "notforday";
                              }

                              // Show an icon if the departure is not ok
                              if (departureStatus !== "ok") {
                                let IconComponent = null;

                                switch (departureStatus) {
                                  case "notobserved":
                                    IconComponent = Waiting;
                                    break;
                                  case "notforday":
                                    IconComponent = Cross;
                                    break;
                                  case "notavailable":
                                  default:
                                    IconComponent = SomethingWrong;
                                    break;
                                }

                                return (
                                  <Tooltip
                                    helpText={`This departure is not available due to: ${departureStatus}, ${dayType}`}
                                    key={`departure_day_${dayType}_${departureStatus}_${departureTime}_${idx}`}>
                                    <TableCell highlight={idx === currentDayTypeIndex}>
                                      <IconComponent width="1rem" fill="var(--grey)" />
                                    </TableCell>
                                  </Tooltip>
                                );
                              }

                              const journeyId = getJourneyId(departure.journey);
                              const journeyIsSelected =
                                selectedJourneyId && selectedJourneyId === journeyId;

                              const plannedObservedDiff =
                                departure.observedDepartureTime.departureTimeDifference;

                              const diffTime = secondsToTimeObject(plannedObservedDiff);
                              const delayType = getDelayType(plannedObservedDiff);

                              const color = getTimelinessColor(
                                delayType,
                                "var(--light-green)",
                                true
                              );

                              const bgColor = getTimelinessColor(
                                delayType,
                                "var(--light-green)"
                              );

                              return (
                                <Tooltip
                                  helpText="Journey list diff"
                                  key={`departure_day_${
                                    departure.dayType
                                  }_${departureTime}`}>
                                  <TableCellButton
                                    highlight={idx === currentDayTypeIndex}
                                    onClick={() => selectJourney(departure.journey)}
                                    color={
                                      journeyIsSelected
                                        ? delayType === "late"
                                          ? "var(--dark-grey)"
                                          : "white"
                                        : color
                                    }
                                    backgroundColor={
                                      journeyIsSelected ? bgColor : "transparent"
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
                  </ListWrapper>
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
