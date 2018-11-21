import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable from "./StopTimetable";
import withStop from "../../hoc/withStop";
import doubleDigit from "../../helpers/doubleDigit";
import {app} from "mobx-app";
import withAllStopDepartures from "../../hoc/withAllStopDepartures";
import {action, observable, toJS} from "mobx";
import styled from "styled-components";
import Input from "../Input";
import {text} from "../../helpers/text";
import get from "lodash/get";
import StopHfpQuery from "../../queries/StopHfpQuery";

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
  selectedJourneyRef = React.createRef();
  clickedJourney = false;

  @observable
  timeRange = {min: "", max: ""};

  @observable
  route = "";

  @observable
  selectedJourneyOffset = 0;

  // We DON'T want this component to react to time changes,
  // as there is a lot to render and it would be too heavy.
  reactionlessTime = toJS(this.props.state.time);

  componentDidUpdate() {
    if (!this.clickedJourney && this.selectedJourneyRef.current) {
      let offset = get(this.selectedJourneyRef, "current.offsetTop", null);

      if (offset) {
        this.setSelectedJourneyOffset(offset);
      }
    }
  }

  @action
  setRouteFilter = (e) => {
    const value = e.target.value;
    this.route = value;
  };

  @action
  setTimeRangeFilter = (which) => (e) => {
    const value = e.target.value;
    this.timeRange[which] = value > 23 || value < 0 ? "00" : doubleDigit(value);
  };

  selectAsJourney = (departure) => (e) => {
    e.preventDefault();
    const {Filters, Journey, Time} = this.props;

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

  setSelectedJourneyOffset = action((offset) => {
    if (offset && offset !== this.selectedJourneyOffset) {
      this.selectedJourneyOffset = offset;
    }
  });

  render() {
    const {
      state: {date, selectedJourney},
      stop,
      loading: timetableLoading,
      departures,
    } = this.props;

    // We query for the hfp data related to the routes and directions on
    // this stop in one go, instead of doing one query per row. Collect
    // all distinct routes and directions in these arrays. Yes, there
    // are stops with more than one direction.

    let routes = [];
    let directions = [];

    for (const departure of departures) {
      const {routeId, direction} = departure;

      if (routes.indexOf(routeId) === -1) {
        routes.push(routeId);
      }

      const intDirection = parseInt(direction, 10);

      if (directions.indexOf(intDirection) === -1) {
        directions.push(intDirection);
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
                value={this.route}
                animatedLabel={false}
                onChange={this.setRouteFilter}
                label={text("domain.route")}
              />
            </RouteFilterContainer>
            <TimeRangeFilterContainer>
              <Input
                type="number"
                value={this.timeRange.min}
                animatedLabel={false}
                label={`${text("general.timerange.min")} ${text("general.hour")}`}
                onChange={this.setTimeRangeFilter("min")}
              />
              <Input
                type="number"
                value={this.timeRange.max}
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
                  routeFilter={this.route}
                  timeRangeFilter={this.timeRange}
                  groupedJourneys={journeys}
                  departures={departures}
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
