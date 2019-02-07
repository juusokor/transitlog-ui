import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import pick from "lodash/pick";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import withRoute from "../hoc/withRoute";
import get from "lodash/get";
import {departureTime, getNormalTime} from "../helpers/time";
import {isWithinRange} from "../helpers/isWithinRange";

@inject(app("state"))
@withRoute
@observer
class JourneyStopTimes extends Component {
  prevStops = [];

  render() {
    const {
      children,
      selectedJourneyEvents = {},
      state: {route: stateRoute, date},
    } = this.props;

    const {events = []} = selectedJourneyEvents;

    // Pick the first event to represent the journey. Only general journey info,
    // like journey_start_time, should be read from this object.
    const journey = events[0];

    if (!journey || !stateRoute || !stateRoute.routeId || !stateRoute.dateBegin) {
      return children({journeyStops: this.prevStops, loading: false});
    }

    const journeyStartTime = get(journey, "journey_start_time", "");
    const [journeyStartHour] = journeyStartTime.split(":");
    const [departureHour, departureMinute] = getNormalTime(journeyStartTime);

    console.log(journey);

    return (
      <SingleRouteQuery
        date={date}
        departureIsNextDay={journeyStartHour > 23}
        departureHours={parseInt(departureHour, 10)}
        departureMinutes={parseInt(departureMinute, 10)}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          console.log(route);

          if (!route || loading || error) {
            return children({journeyStops: this.prevStops, loading});
          }

          const originDeparture =
            get(route, "originStop.departures.nodes", []).find(
              ({hours, minutes, dayType, dateBegin, dateEnd, isNextDay}) =>
                departureTime({hours, minutes, isNextDay}) === journeyStartTime &&
                isWithinRange(date, dateBegin, dateEnd)
            ) || null;

          return children({journeyStops: this.prevStops, loading});
        }}
      </SingleRouteQuery>
    );
  }
}

export default JourneyStopTimes;
