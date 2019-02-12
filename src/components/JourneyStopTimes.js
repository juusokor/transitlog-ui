import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import pick from "lodash/pick";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import withRoute from "../hoc/withRoute";
import get from "lodash/get";
import {departureTime, getNormalTime} from "../helpers/time";
import {isWithinRange} from "../helpers/isWithinRange";
import sortBy from "lodash/sortBy";
import {
  filterRouteSegments,
  filterDepartures,
} from "../helpers/filterJoreCollections";
import omit from "lodash/omit";
import orderBy from "lodash/orderBy";
import {stopDepartureTimes} from "../helpers/stopDepartureTimes";
import {stopArrivalTimes} from "../helpers/stopArrivalTimes";

@inject(app("state"))
@withRoute()
@observer
class JourneyStopTimes extends Component {
  render() {
    const {
      children,
      selectedJourneyEvents,
      state: {route: stateRoute, date},
    } = this.props;

    // selectedJourneyEvents is an array of objects like {journeyId: "", events: []}
    const events = get(selectedJourneyEvents, "[0].events", []);

    // Pick the first event to represent the journey. Only general journey info,
    // like journey_start_time, should be read from this object.
    const journey = events[0];

    const journeyStartTime = get(journey, "journey_start_time", "");
    const [journeyStartHour] = journeyStartTime.split(":");
    const [departureHour, departureMinute] = getNormalTime(journeyStartTime).split(
      ":"
    );

    return (
      <SingleRouteQuery
        skip={!stateRoute || !stateRoute.routeId || !stateRoute.dateBegin}
        date={date}
        departureIsNextDay={journeyStartHour > 23}
        departureHours={parseInt(departureHour, 10)}
        departureMinutes={parseInt(departureMinute, 10)}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          if (!journey || !route || loading || error) {
            return children({journeyStops: [], loading});
          }

          // We need a departureId for getting the correct departure for each stop.
          // To get the departureId for this journey, get the origin stop departure.
          const originDeparture =
            get(route, "originStop.departures.nodes", []).find(
              ({hours, minutes, dayType, dateBegin, dateEnd, isNextDay}) =>
                departureTime({hours, minutes, isNextDay}) === journeyStartTime &&
                isWithinRange(date, dateBegin, dateEnd)
            ) || null;

          if (!originDeparture) {
            return children({journeyStops: [], loading});
          }

          const stops = sortBy(
            filterRouteSegments(get(route, "routeSegments.nodes", []), date),
            "stopIndex"
          ).map((routeSegment) => {
            const departure = filterDepartures(
              get(routeSegment, "stop.departures.nodes", []),
              date
            ).filter(
              (departure) => departure.departureId === originDeparture.departureId
            )[0];

            const stopEvents = orderBy(
              events.filter((pos) => pos.next_stop_id === routeSegment.stopId),
              "received_at_unix",
              "desc"
            );

            const stopArrival = departure
              ? stopArrivalTimes(stopEvents, departure, date)
              : null;

            const stopDeparture = departure
              ? stopDepartureTimes(stopEvents, departure, date)
              : null;

            return {
              destination: routeSegment.destinationFi,
              distanceFromPrevious: routeSegment.distanceFromPrevious,
              distanceFromStart: routeSegment.distanceFromStart,
              duration: routeSegment.duration,
              stopIndex: routeSegment.stopIndex,
              timingStopType: routeSegment.timingStopType,
              ...omit(get(routeSegment, "stop", {}), "departures", "__typename"),
              departure,
              ...stopDeparture,
              ...stopArrival,
            };
          });

          return children({journeyStops: stops, loading: false});
        }}
      </SingleRouteQuery>
    );
  }
}

export default JourneyStopTimes;
