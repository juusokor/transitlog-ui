import React from "react";
import styled from "styled-components";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import pick from "lodash/pick";
import get from "lodash/get";
import SingleRouteQuery from "../../../queries/SingleRouteQuery";
import JourneyStops from "./JourneyStops";
import Loading from "../../Loading";
import JourneyInfo from "./JourneyInfo";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import orderBy from "lodash/orderBy";
import TerminalStop from "./TerminalStop";
import {stopDepartureTimes} from "../../../helpers/stopDepartureTimes";
import withRoute from "../../../hoc/withRoute";
import {departureTime} from "../../../helpers/time";
import {isWithinRange} from "../../../helpers/isWithinRange";
import {stopArrivalTimes} from "../../../helpers/stopArrivalTimes";

const JourneyPanelWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: stretch;
`;

const ScrollContainer = styled.div`
  height: 100%;
  position: relative;
  overflow: auto;
`;

const JourneyPanelContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  width: 100%;
`;

const StopsListWrapper = styled.div`
  padding: 2rem 0 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto 0;
`;

@withRoute
@inject(app("Time"))
@observer
class JourneyDetails extends React.Component {
  onClickTime = (time) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(time);
  };

  render() {
    const {
      state: {date, route: stateRoute},
      selectedJourneyEvents,
    } = this.props;
    // Select the first event to define the journey
    const events = get(selectedJourneyEvents, "[0].events", []);
    const journey = events[0];

    return (
      <SingleRouteQuery
        skip={!journey || !stateRoute || !stateRoute.routeId}
        date={date}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          if (!route || loading || error) {
            return (
              <LoadingContainer>
                <Loading />
              </LoadingContainer>
            );
          }

          const currentDayType = getDayTypeFromDate(date);

          /*
            Origin stop times
           */

          // Get the first departure of the journey from the origin stop departures
          const originDeparture =
            get(route, "originStop.departures.nodes", []).find(
              ({
                hours,
                minutes,
                dayType,
                routeId,
                direction,
                dateBegin,
                dateEnd,
                isNextDay,
              }) =>
                departureTime({hours, minutes, isNextDay}) ===
                  get(journey, "journey_start_time", "") &&
                isWithinRange(date, dateBegin, dateEnd) &&
                dayType === currentDayType &&
                routeId === get(journey, "route_id", "") &&
                parseInt(direction) === parseInt(get(journey, "direction_id", 0))
            ) || null;

          const originStopId = get(route, "originstopId", "");

          const originStopHfp = orderBy(
            events.filter((pos) => pos.next_stop_id === originStopId),
            "received_at_unix",
            "desc"
          );

          const originDepartureTimes = originDeparture
            ? stopDepartureTimes(originStopHfp, originDeparture, date)
            : null;

          const originArrivalTimes = originDeparture
            ? stopArrivalTimes(originStopHfp, originDeparture, date)
            : null;

          /*
            Destination stop times
           */

          // Get the journey's destination stop departure by matching the
          // departureId of the originStop departure.
          const destinationDeparture =
            (originDeparture
              ? get(route, "destinationStop.departures.nodes", []).find(
                  ({departureId, dayType, routeId, direction, dateBegin, dateEnd}) =>
                    departureId === get(originDeparture, "departureId", 0) &&
                    isWithinRange(date, dateBegin, dateEnd) &&
                    dayType === currentDayType &&
                    routeId === get(journey, "route_id", "") &&
                    parseInt(direction) === parseInt(get(journey, "direction_id", 0))
                )
              : null) || null;

          const destinationStopId = get(route, "destinationStop.stopId", "");

          const destinationStopHfp = orderBy(
            events.filter((pos) => pos.next_stop_id === destinationStopId),
            "received_at_unix",
            "desc"
          );

          const destinationDepartureTimes = destinationDeparture
            ? stopDepartureTimes(destinationStopHfp, destinationDeparture, date)
            : null;

          const destinationArrivalTimes = destinationDeparture
            ? stopArrivalTimes(destinationStopHfp, destinationDeparture, date)
            : null;

          return (
            <JourneyPanelWrapper>
              <JourneyDetailsHeader
                vehicleId={journey.unique_vehicle_id}
                date={date}
                time={journey.journey_start_time}
                mode={get(route, "mode", "BUS")}
                routeId={get(route, "routeId", "")}
                desi={get(journey, "desi")}
                name={get(route, "nameFi")}
              />
              <ScrollContainer>
                <JourneyPanelContent>
                  <JourneyInfo
                    date={date}
                    departure={originDeparture}
                    journey={journey}
                    journeyHfp={events}
                    originStopTimes={
                      originDepartureTimes && originArrivalTimes
                        ? {...originArrivalTimes, ...originDepartureTimes}
                        : null
                    }
                    destinationStopTimes={
                      destinationDepartureTimes && destinationArrivalTimes
                        ? {...destinationArrivalTimes, ...destinationDepartureTimes}
                        : null
                    }
                  />
                  <StopsListWrapper>
                    <TerminalStop
                      isFirstTerminal={true}
                      departureTimes={originDepartureTimes} // TerminalStop can receive precalculated stop times.
                      arrivalTimes={originArrivalTimes}
                      stop={get(route, "originStop", {})}
                      date={date}
                      onClickTime={this.onClickTime}
                    />
                    <JourneyStops
                      originDeparture={originDeparture}
                      journeyHfp={events}
                      date={date}
                      route={route}
                      onClickTime={this.onClickTime}
                    />
                    <TerminalStop
                      isLastTerminal={true}
                      departureTimes={destinationDepartureTimes}
                      arrivalTimes={destinationArrivalTimes}
                      stop={get(route, "destinationStop", {})}
                      date={date}
                      onClickTime={this.onClickTime}
                    />
                  </StopsListWrapper>
                </JourneyPanelContent>
              </ScrollContainer>
            </JourneyPanelWrapper>
          );
        }}
      </SingleRouteQuery>
    );
  }
}
export default JourneyDetails;
