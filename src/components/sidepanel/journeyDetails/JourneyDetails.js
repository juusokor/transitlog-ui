import React from "react";
import styled from "styled-components";
import withSelectedJourney from "../../../hoc/withSelectedJourney";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../../hoc/withRoute";
import pick from "lodash/pick";
import get from "lodash/get";
import SingleRouteQuery from "../../../queries/SingleRouteQuery";
import JourneyStops from "./JourneyStops";
import Loading from "../../Loading";
import JourneyInfo from "./JourneyInfo";
import doubleDigit from "../../../helpers/doubleDigit";
import isWithinRange from "date-fns/is_within_range";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import orderBy from "lodash/orderBy";
import TerminalStop from "./TerminalStop";
import {stopTimes} from "../../../helpers/stopTimes";

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
@withSelectedJourney
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
      selectedJourneyHfp,
    } = this.props;
    // Select the first event to define the journey
    const journey = selectedJourneyHfp[0];

    if (!journey || !stateRoute || !stateRoute.routeId) {
      return (
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      );
    }

    return (
      <SingleRouteQuery
        date={date}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          if (loading || error) {
            return (
              <LoadingContainer>
                <Loading />
              </LoadingContainer>
            );
          }

          const currentDayType = getDayTypeFromDate(date);

          // Get the first departure of the journey from the origin stop departures
          const originDeparture =
            get(route, "originStop.departures.nodes", []).find(
              ({hours, minutes, dayType, routeId, direction, dateBegin, dateEnd}) =>
                `${doubleDigit(hours)}:${doubleDigit(minutes)}:00` ===
                  get(journey, "journey_start_time", "") &&
                isWithinRange(date, dateBegin, dateEnd) &&
                dayType === currentDayType &&
                routeId === get(journey, "route_id", "") &&
                parseInt(direction) === parseInt(get(journey, "direction_id", 0))
            ) || null;

          const originStopId = get(route, "originstopId", "");

          const originStopTimes = originDeparture
            ? stopTimes(
                originDeparture,
                orderBy(
                  selectedJourneyHfp.filter(
                    (pos) => pos.next_stop_id === originStopId
                  ),
                  "received_at_unix",
                  "desc"
                ),
                originDeparture,
                date
              )
            : null;

          return (
            <JourneyPanelWrapper>
              <JourneyDetailsHeader
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
                    journeyHfp={selectedJourneyHfp}
                    originStopTimes={originStopTimes}
                  />
                  <StopsListWrapper>
                    <TerminalStop
                      isFirstTerminal={true}
                      stopTimes={originStopTimes} // TerminalStop can receive precalculated stop times.
                      stop={get(route, "originStop", {})}
                      journeyPositions={selectedJourneyHfp}
                      date={date}
                      onClickTime={this.onClickTime}
                    />
                    <JourneyStops
                      originDeparture={originDeparture}
                      journeyHfp={selectedJourneyHfp}
                      date={date}
                      route={route}
                      onClickTime={this.onClickTime}
                    />
                    <TerminalStop
                      isLastTerminal={true}
                      originDeparture={originDeparture}
                      stop={get(route, "destinationStop", {})}
                      journeyPositions={selectedJourneyHfp}
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
