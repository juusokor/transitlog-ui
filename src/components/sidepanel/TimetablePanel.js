import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable from "./StopTimetable";
import withStop from "../../hoc/withStop";
import {app} from "mobx-app";
import withAllStopDepartures from "../../hoc/withAllStopDepartures";
import {toJS, reaction} from "mobx";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import StopHfpQuery from "../../queries/StopHfpQuery";
import {sortByOperationDay} from "../../helpers/sortByOperationDay";
import doubleDigit from "../../helpers/doubleDigit";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import {createDebouncedObservable} from "../../helpers/createDebouncedObservable";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";
import {Button} from "../Forms";
import {setResetListener} from "../../stores/FilterStore";

const TimetableFilters = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-end;
`;

const RouteFilterContainer = styled.div`
  flex: 1 1 50%;

  label {
    font-size: 0.75rem;
  }
`;

const TimeRangeFilterContainer = styled.div`
  flex: 1 1 50%;
  display: flex;

  > * {
    margin-right: 0;
    margin-left: 0.5rem;
  }

  label {
    font-size: 0.75rem;
  }
`;

const ClearButton = styled(Button).attrs({small: true, primary: true})`
  margin-left: 0.5rem;
  margin-bottom: 1px;
`;

@inject(app("Filters", "Journey", "Time"))
@withStop({fetchRouteSegments: false})
@withAllStopDepartures
@observer
class TimetablePanel extends Component {
  removeResetListener = () => {};
  disposeScrollResetReaction = () => {};
  updateScrollOffset = () => {};

  // Create debounced observable values for the timetable filters.
  routeFilter = createDebouncedObservable(getUrlValue("timetableRoute"), 500);
  timeRangeFilter = createDebouncedObservable(
    {
      min: getUrlValue("timetableTimeRange.min"),
      max: getUrlValue("timetableTimeRange.max"),
    },
    500
  );

  // We DON'T want this component to react to time changes,
  // as there is a lot to render and it would be too heavy.
  reactionlessTime = toJS(this.props.state.time);

  componentDidMount() {
    this.removeResetListener = setResetListener(this.onClearFilters);

    this.disposeScrollResetReaction = reaction(
      () => [this.timeRangeFilter.debouncedValue, this.routeFilter.debouncedValue],
      () => this.updateScrollOffset(true),
      {delay: 1}
    );
  }

  componentWillUnmount() {
    // Always dispose reactions to prevent memory leaks. This component might mount
    // an unmount often, so it is very important to do it here.
    this.disposeScrollResetReaction();

    // Remove the reset listener
    this.removeResetListener();
  }

  setRouteFilter = (e) => {
    const value = get(e, "target.value", e);
    this.routeFilter.setValue(value);
    setUrlValue("timetableRoute", value);
  };

  setTimeRangeFilter = (which) => (e) => {
    const value = e.target.value;

    const reverse = which === "min" ? "max" : "min";

    // If the time is not a valid hour, make it empty.
    const setValue = value > 23 || value < 0 ? "" : value;

    // The time range value is set as an object.
    const nextValue = {
      [reverse]: this.timeRangeFilter.value[reverse],
      [which]: setValue,
    };

    this.timeRangeFilter.setValue(nextValue);
    setUrlValue(`timetableTimeRange.${which}`, setValue);
  };

  onClearFilters = () => {
    this.timeRangeFilter.setValue({min: "", max: ""});
    this.routeFilter.setValue("");

    setUrlValue(`timetableTimeRange.min`, null);
    setUrlValue(`timetableTimeRange.max`, null);
    setUrlValue(`timetableRoute`, null);
  };

  selectAsJourney = (departure) => (e) => {
    e.preventDefault();
    const {Filters, Journey, Time} = this.props;

    // Set the selected time from the departure time
    const currentTime = `${doubleDigit(departure.hours)}:${doubleDigit(
      departure.minutes
    )}:00`;

    const route = {
      direction: departure.direction,
      routeId: departure.routeId,
    };

    Time.setTime(currentTime);
    Filters.setRoute(route);

    if (departure.observed) {
      const {observed} = departure;
      Journey.setSelectedJourney(observed);
    }
  };

  getDeparturesByHour() {
    const {departures} = this.props;
    // Group into hours while making sure to separate pre-4:30 and post-4:30 departures
    const byHour = groupBy(departures, ({hours, minutes}) => {
      if (hours === 4 && minutes >= 30) {
        return `${doubleDigit(hours)}:30`;
      }

      return `${doubleDigit(hours)}:00`;
    });

    // Ensure that night departures from the same operation
    // day comes last in the timetable list.
    return orderBy(Object.entries(byHour), ([hour]) => sortByOperationDay(hour));
  }

  render() {
    const {
      state: {date, selectedJourney},
      stop,
      loading: timetableLoading,
      departures,
    } = this.props;

    // Collect values. The filter values are read as debounced values.
    const routeFilter = this.routeFilter.debouncedValue;
    const timeRangeFilter = this.timeRangeFilter.debouncedValue;
    const departuresByHour = this.getDeparturesByHour();

    // Collect all routes that are going to be queried for
    let routes = [];

    const {min, max} = timeRangeFilter;

    for (const departure of departures) {
      const {routeId, direction, hours} = departure;

      // If there is a timerange filter set, ignore routes
      // from departures that fall outside the filter.
      if ((min && hours < parseInt(min)) || (max && hours > parseInt(max))) {
        continue;
      }

      // Clean up the routeId to be compatible with what
      // the user would enter into the filter field.
      const routeIdFilterTerm = routeId
        .substring(1)
        .replace(/^0+/, "")
        .toLowerCase();

      // If there is a route filter set, we don't want
      // to query for routes that do not match.
      if (routeFilter && !routeIdFilterTerm.startsWith(routeFilter.toLowerCase())) {
        continue;
      }

      if (!routes.find((r) => r.routeId === routeId && r.direction === direction)) {
        routes.push({routeId, direction});
      }
    }

    return (
      stop && (
        <StopHfpQuery
          key={`stop_hfp_${stop.stopId}_${date}`}
          skip={routes.length === 0} // Skip if there are no routes to fetch
          stopId={stop.stopId}
          routes={routes}
          routeFilter={routeFilter.value}
          date={date}>
          {({journeys, loading}) => (
            <SidepanelList
              loading={timetableLoading || loading}
              header={
                <TimetableFilters>
                  <RouteFilterContainer>
                    <Input
                      value={this.routeFilter.value} // The value is not debounced here
                      animatedLabel={false}
                      onChange={this.setRouteFilter}
                      label={text("domain.route")}
                    />
                  </RouteFilterContainer>
                  <TimeRangeFilterContainer>
                    <Input
                      type="number"
                      value={this.timeRangeFilter.value.min} // The value is not debounced here either
                      animatedLabel={false}
                      label={`${text("general.timerange.min")} ${text(
                        "general.hour"
                      )}`}
                      onChange={this.setTimeRangeFilter("min")}
                    />
                    <Input
                      type="number"
                      value={this.timeRangeFilter.value.max} // Nor is it debounced here :)
                      animatedLabel={false}
                      label={`${text("general.timerange.max")} ${text(
                        "general.hour"
                      )}`}
                      onChange={this.setTimeRangeFilter("max")}
                    />
                  </TimeRangeFilterContainer>
                  <ClearButton onClick={this.onClearFilters}>Clear</ClearButton>
                </TimetableFilters>
              }>
              {(scrollRef, updateScrollOffset) => {
                // Will be called when filters, and thus the size of the list, changes
                this.updateScrollOffset = updateScrollOffset;

                return (
                  <StopTimetable
                    key={`stop_timetable_${stop.stopId}_${date}`}
                    loading={loading || timetableLoading}
                    time={this.reactionlessTime}
                    focusRef={scrollRef}
                    setScrollOffset={updateScrollOffset}
                    routeFilter={routeFilter}
                    timeRangeFilter={timeRangeFilter}
                    journeys={journeys}
                    departuresByHour={departuresByHour}
                    stop={stop}
                    date={date}
                    selectedJourney={selectedJourney}
                    onSelectAsJourney={this.selectAsJourney}
                  />
                );
              }}
            </SidepanelList>
          )}
        </StopHfpQuery>
      )
    );
  }
}

export default TimetablePanel;
