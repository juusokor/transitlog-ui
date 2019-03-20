import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {toJS, reaction} from "mobx";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import {createDebouncedObservable} from "../../helpers/createDebouncedObservable";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";
import {Button} from "../Forms";
import {setResetListener} from "../../stores/FilterStore";
import VirtualizedSidepanelList from "./VirtualizedSidepanelList";
import TimetableDeparture from "./TimetableDeparture";
import {getDepartureByTime} from "../../helpers/getDepartureByTime";
import getJourneyId from "../../helpers/getJourneyId";
import DeparturesQuery from "../../queries/DeparturesQuery";
import {withStop} from "../../hoc/withStop";

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
@withStop
@observer
class TimetablePanel extends Component {
  removeResetListener = () => {};
  disposeScrollResetReaction = () => {};
  updateScrollOffset = () => {};

  // Create debounced observable values for the timetable filters.
  routeFilter = createDebouncedObservable(getUrlValue("timetableRoute"), 500);
  timeRangeFilter = createDebouncedObservable(
    {
      min: getUrlValue("timetableTimeRange.min", undefined),
      max: getUrlValue("timetableTimeRange.max", undefined),
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
    const {Journey, Time} = this.props;

    const currentTime = get(
      departure,
      "observedDepartureTime.departureTime",
      get(departure, "plannedDepartureTime.departureTime", "")
    );

    if (currentTime) {
      Time.setTime(currentTime);
    }

    if (departure.journey) {
      Journey.setSelectedJourney(departure.journey);
    }
  };

  renderRow = (props) => (list) => ({key, index, style, isScrolling, isVisible}) => {
    const departure = list[index];
    const instance = get(departure, "journey.instance", 0);
    const departureTime = get(departure, "plannedDepartureTime.departureDateTime", "");

    return (
      <div style={style} key={key}>
        <TimetableDeparture
          key={`departure_${departure.departureId}_${departure.routeId}_${
            departure.direction
          }_${departureTime}_${instance}`}
          isScrolling={isScrolling}
          isVisible={isVisible}
          departure={departure}
          {...props}
        />
      </div>
    );
  };

  renderList = (departures, renderRow, loading, focusedIndex) => {
    const {
      state: {date, stop: stopId},
    } = this.props;

    return stopId ? (
      <VirtualizedSidepanelList
        date={date}
        scrollToIndex={focusedIndex !== -1 ? focusedIndex : undefined}
        list={departures}
        renderRow={renderRow(departures)}
        rowHeight={35}
        loading={loading}
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
    ) : (
      "No departures."
    );
  };

  render() {
    const {
      stop,
      stopLoading,
      state: {date, selectedJourney, stop: stopId},
    } = this.props;

    // Collect values. The filter values are read as debounced values.
    const routeFilter = this.routeFilter.debouncedValue;
    const timeRangeFilter = this.timeRangeFilter.debouncedValue;

    const {min, max} = timeRangeFilter;

    // TODO: Make selecting a journey work

    return (
      <DeparturesQuery
        stopId={stopId}
        date={date}
        routeId={routeFilter || undefined}
        minHour={min || undefined}
        maxHour={max || undefined}>
        {({departures, loading}) => {
          const selectedJourneyId = getJourneyId(selectedJourney);

          const focusedDeparture = selectedJourneyId
            ? departures.find(({journey}) =>
                journey ? selectedJourneyId === getJourneyId(journey) : false
              )
            : getDepartureByTime(departures, this.reactionlessTime);

          const focusedIndex = focusedDeparture
            ? departures.findIndex((departure) => departure === focusedDeparture)
            : -1;
          const rowRenderer = this.renderRow({
            selectedJourney,
            onClick: this.selectAsJourney,
            date,
            stop,
          });

          return this.renderList(
            departures,
            rowRenderer,
            loading || stopLoading,
            focusedIndex
          );
        }}
      </DeparturesQuery>
    );
  }
}

export default TimetablePanel;
