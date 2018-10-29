import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable from "./StopTimetable";
import withStop from "../../hoc/withStop";
import doubleDigit from "../../helpers/doubleDigit";
import {app} from "mobx-app";
import withAllStopDepartures from "../../hoc/withAllStopDepartures";

@inject(app("Filters", "Journey", "Time"))
@withStop
@withAllStopDepartures
@observer
class Timetables extends Component {
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
      const {journey} = departure;

      Journey.setSelectedJourney(journey);
      Journey.requestJourneys({
        time: journey.journey_start_time,
        route,
        date: journey.oday,
      });
    }
  };

  render() {
    const {
      state: {date, selectedJourney},
      stop,
      route,
      departures,
    } = this.props;

    return (
      <SidepanelList
        header={
          <>
            <span>[filter placeholder]</span>
            <span>[filter placeholder]</span>
          </>
        }>
        {stop && (
          <StopTimetable
            departures={departures}
            route={route}
            stop={stop}
            date={date}
            selectedJourney={selectedJourney}
            onSelectAsJourney={this.selectAsJourney}
          />
        )}
      </SidepanelList>
    );
  }
}

export default Timetables;
