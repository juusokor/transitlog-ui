import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable, {AVG_DEPARTURES_THRESHOLD} from "./StopTimetable";
import withStop from "../../hoc/withStop";
import {app} from "mobx-app";
import withAllStopDepartures from "../../hoc/withAllStopDepartures";
import {action, observable, toJS, computed, reaction} from "mobx";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import StopHfpQuery from "../../queries/StopHfpQuery";
import {sortByOperationDay} from "../../helpers/sortByOperationDay";
import doubleDigit from "../../helpers/doubleDigit";
import orderBy from "lodash/orderBy";
import meanBy from "lodash/meanBy";
import groupBy from "lodash/groupBy";
import memoize from "memoized-decorator";
import {combineDateAndTime} from "../../helpers/time";
import * as mobxUtils from "mobx-utils";
import {createDebouncedObservable} from "../../helpers/createDebouncedObservable";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";

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

@inject(app("Filters", "Journey", "Time"))
@withStop({fetchRouteSegments: false})
@withAllStopDepartures
@observer
class TimetablePanel extends Component {
  disposeTimeRangeReaction = () => {};
  selectedJourneyRef = React.createRef();
  clickedJourney = false;

  // Create debounced observable values for the timetable filters.
  routeFilter = createDebouncedObservable(getUrlValue("timetableRoute"));
  timeRangeFilter = createDebouncedObservable({
    min: getUrlValue("timetableTimeRange.min"),
    max: getUrlValue("timetableTimeRange.max"),
  });

  // If there are too many departures, we want to set a time range filter by default.
  // This method figures out the range to set if one needs setting.
  getDefaultTimeRangeValue(timeRange, perHour, date, time) {
    let {min = "", max = ""} = timeRange;

    if (!min && !max && perHour > AVG_DEPARTURES_THRESHOLD && perHour < 40) {
      const currentTime = combineDateAndTime(date, time, "Europe/Helsinki");
      // Use the average numbe of departures per hour to determine how large of a range to set.
      // More departures means narrower ranges, the idea is to not have the fetch take forever.
      const hourModifier = perHour > 30 ? 2 : perHour > 20 ? 3 : 4;
      const modifierHalf = Math.floor(hourModifier / 2);

      min = currentTime
        .clone()
        .subtract(modifierHalf, "hours")
        .format("HH");

      max = currentTime
        .clone()
        .add(modifierHalf, "hours")
        .format("HH");
    }

    return {min, max};
  }

  @observable
  selectedJourneyOffset = 0;

  // We DON'T want this component to react to time changes,
  // as there is a lot to render and it would be too heavy.
  reactionlessTime = toJS(this.props.state.time);

  componentDidUpdate() {
    // This part makes the list scroll to the currently selected journey
    if (!this.clickedJourney && this.selectedJourneyRef.current) {
      let offset = get(this.selectedJourneyRef, "current.offsetTop", null);

      if (offset) {
        this.setSelectedJourneyOffset(offset);
      }
    }

    // Check mobx docs on reaction if this is unclear.
    this.disposeTimeRangeReaction = reaction(
      () => {
        // The reaction will only react to changes in values used here in the first function.
        const {date} = this.props.state;
        const time = this.reactionlessTime;
        const perHour = this.avgDeparturesPerHour;
        const timeRange = this.timeRangeFilter.value;

        return {
          timeRange,
          perHour,
          date,
          time,
        };
      },
      ({timeRange, perHour, date, time}) => {
        const {min: prevMin, max: prevMax} = timeRange;

        if (!prevMin && !prevMax) {
          const nextTimeRange = this.getDefaultTimeRangeValue(
            timeRange,
            perHour,
            date,
            time
          );

          // While values used here will not cause a reaction, se still need to be
          // careful to not create infinite update loops.
          const {min, max} = nextTimeRange;

          if ((min && prevMin !== min) || (max && prevMax !== max)) {
            this.timeRangeFilter.setValue(nextTimeRange);
          }
        }
      },
      {fireImmediately: true}
    );
  }

  componentWillUnmount() {
    // Always dispose reactions to prevent memory leaks. This component might mount
    // an unmount often, so it is very important to do it here.
    this.disposeTimeRangeReaction();
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

    if (departure.journey) {
      this.clickedJourney = true;
      const {journey} = departure;

      Journey.setSelectedJourney(journey);
      Journey.requestJourneys({
        time: journey.journey_start_time,
        route,
        date: journey.oday,
      });
    }
  };

  // Set the offset where the selected journey is located so we can scroll to it.
  setSelectedJourneyOffset = action((offset) => {
    if (offset && offset !== this.selectedJourneyOffset) {
      this.selectedJourneyOffset = offset;
    }
  });

  // getDeparturesByHour is memoized and needs a key. Although the method itself does
  // not take arguments, provide this key as its argument for the memoization to work.
  get departuresKey() {
    const {stop, date, departures} = this.props;

    if (departures.length === 0) {
      return "";
    }

    return `${get(stop, "stopId", stop)}_${date}`;
  }

  @computed
  get avgDeparturesPerHour() {
    const departuresByHour = this.getDeparturesByHour(this.departuresKey);
    const routeFilter = this.routeFilter.debouncedValue;

    // Figure out how many departures this stop has planned per hour on average.
    // This is used to determine if observed times can be fetched immediately,
    // or if we should wait for the user to filter the list. Filtering by
    // route should also be taken into account here.
    return Math.round(
      meanBy(departuresByHour, ([hour, hourDepartures]) => {
        // The route filter will help to ease the burden of too many departures, so
        // make sure that the average does not include routes that do not match the filter.
        if (!routeFilter) {
          return hourDepartures.length;
        }

        return hourDepartures.filter(
          (departure) => departure.routeId === routeFilter
        ).length;
      })
    );
  }

  // This will get called a few times during updates, so it is memoized.
  // Although the method itself does not use the argument, always pass
  // this.departuresKey when calling it for the memoization to work.
  @memoize
  getDeparturesByHour(departuresKey) {
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
    // the per hour average number of departures is used to determine if we
    // allow the app to fetch data immediately or if we need to wait for filter input.
    const departuresPerHour = this.avgDeparturesPerHour;
    const departuresByHour = this.getDeparturesByHour(this.departuresKey);

    // We query for the hfp data related to the routes and directions on
    // this stop in one go, instead of doing one query per row. Collect
    // all distinct routes and directions in these arrays. Yes, there
    // are stops with more than one direction.

    let routes = [];
    let directions = [];

    // If there isn't an ungodly amount of departures per hour, or of the route
    // filter is set, collect all the routes and directions for the hfp query.
    // The query will not run if the routes array is empty.
    if (departuresPerHour < 40 || !!routeFilter) {
      for (const departure of departures) {
        const {routeId, direction} = departure;
        // Clean up the routeId to be compatible with what
        // the user will enter into the filter field.
        const routeIdFilterTerm = routeId
          .substring(1)
          .replace(/^0+/, "")
          .toLowerCase();

        // If there is a route filter set, we don't want
        // to query for routes that do not match.
        if (
          routeFilter &&
          !routeIdFilterTerm.startsWith(routeFilter.toLowerCase())
        ) {
          continue;
        }

        // No need for more than one of everything
        if (routes.indexOf(routeId) === -1) {
          routes.push(routeId);
        }

        const intDirection = parseInt(direction, 10);

        if (directions.indexOf(intDirection) === -1) {
          directions.push(intDirection);
        }
      }
    }

    return (
      <SidepanelList
        loading={timetableLoading}
        scrollOffset={this.selectedJourneyOffset}
        header={
          <>
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
                label={`${text("general.timerange.min")} ${text("general.hour")}`}
                onChange={this.setTimeRangeFilter("min")}
              />
              <Input
                type="number"
                value={this.timeRangeFilter.value.max} // Nor is it debounced here :)
                animatedLabel={false}
                label={`${text("general.timerange.max")} ${text("general.hour")}`}
                onChange={this.setTimeRangeFilter("max")}
              />
            </TimeRangeFilterContainer>
          </>
        }>
        {stop && (
          <StopHfpQuery
            skip={routes.length === 0} // Skip if there are no routes to fetch
            stopId={stop.stopId}
            routes={routes}
            directions={directions}
            date={date}>
            {({journeys, loading}) => {
              return (
                <StopTimetable
                  key={`stop_timetable_${stop.stopId}_${date}`}
                  loading={timetableLoading || loading}
                  time={this.reactionlessTime}
                  focusRef={this.selectedJourneyRef}
                  routeFilter={routeFilter}
                  timeRangeFilter={timeRangeFilter}
                  groupedJourneys={journeys}
                  departuresByHour={departuresByHour}
                  departuresPerHour={this.avgDeparturesPerHour}
                  stop={stop}
                  date={date}
                  selectedJourney={selectedJourney}
                  onSelectAsJourney={this.selectAsJourney}
                />
              );
            }}
          </StopHfpQuery>
        )}
      </SidepanelList>
    );
  }
}

export default TimetablePanel;
