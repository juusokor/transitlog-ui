import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withAllStopDepartures from "../../hoc/withAllStopDepartures";
import {toJS, reaction, observable, action} from "mobx";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import sortBy from "lodash/sortBy";
import {createDebouncedObservable} from "../../helpers/createDebouncedObservable";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";
import {Button} from "../Forms";
import {setResetListener} from "../../stores/FilterStore";
import VirtualizedSidepanelList from "./VirtualizedSidepanelList";
import TimetableDeparture from "./TimetableDeparture";
import {getDepartureByTime} from "../../helpers/getDepartureByTime";
import getJourneyId from "../../helpers/getJourneyId";
import {createCompositeJourney} from "../../stores/journeyActions";
import {timeToSeconds, departureTime} from "../../helpers/time";
import {setUpdateListener} from "../../stores/UpdateManager";

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

    // Dispose the reset listener
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

  sortDepartures(departures) {
    return sortBy(departures, (departure) =>
      timeToSeconds(departureTime(departure))
    );
  }

  renderRow = (list, props) => ({key, index, style, isScrolling, isVisible}) => {
    const departure = list[index];

    return (
      <div style={style} key={key}>
        <TimetableDeparture
          key={`departure_${departure.departureId}_${departure.routeId}_${
            departure.direction
          }_${departure.hours}_${departure.minutes}`}
          isScrolling={isScrolling}
          isVisible={isVisible}
          departure={departure}
          {...props}
        />
      </div>
    );
  };

  render() {
    const {
      state: {date, selectedJourney, stop: stopId},
      stop,
      loading: timetableLoading,
      departures,
    } = this.props;

    // Collect values. The filter values are read as debounced values.
    const routeFilter = this.routeFilter.debouncedValue;
    const timeRangeFilter = this.timeRangeFilter.debouncedValue;

    const {min, max} = timeRangeFilter;

    const sortedDepartures = this.sortDepartures(
      // Apply hour and route filters to the departures array
      departures.filter(({routeId, hours}) => {
        // If there is a timerange filter set, ignore routes
        // from departures that fall outside the filter.
        if ((min && hours < parseInt(min)) || (max && hours > parseInt(max))) {
          return false;
        }

        // Clean up the routeId to be compatible with what
        // the user would enter into the filter field.
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
          return false;
        }

        return true;
      })
    );

    const rowRenderer = this.renderRow(sortedDepartures, {
      selectedJourney,
      onClick: this.selectAsJourney,
      stop,
      date,
    });

    const selectedJourneyId = getJourneyId(selectedJourney);

    const focusedDeparture = selectedJourneyId
      ? sortedDepartures.find((departure) => {
          const originDeparture = get(departure, "originDeparture", {});
          const originDepartureTime = `${originDeparture.hours}:${
            originDeparture.minutes
          }:00`;

          return (
            selectedJourneyId ===
            getJourneyId(
              createCompositeJourney(date, departure, originDepartureTime, 0)
            )
          );
        })
      : getDepartureByTime(sortedDepartures, this.reactionlessTime);

    const focusedIndex = focusedDeparture
      ? sortedDepartures.findIndex((departure) => departure === focusedDeparture)
      : -1;

    return (
      stopId && (
        <VirtualizedSidepanelList
          date={date}
          scrollToIndex={focusedIndex !== -1 ? focusedIndex : undefined}
          list={sortedDepartures}
          renderRow={rowRenderer}
          rowHeight={35}
          loading={timetableLoading}
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
              <ClearButton onClick={this.onClearFilters}>Clear</ClearButton>
            </TimetableFilters>
          }
        />
      )
    );
  }
}

export default TimetablePanel;
