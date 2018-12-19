import React from "react";
import styled from "styled-components";
import withSelectedJourney from "../../../hoc/withSelectedJourney";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import isWithinRange from "date-fns/is_within_range";
import TerminalStop from "./TerminalStop";
import doubleDigit from "../../../helpers/doubleDigit";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import Equipment from "./Equipment";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../../hoc/withRoute";
import pick from "lodash/pick";
import sortBy from "lodash/sortBy";
import get from "lodash/get";
import SingleRouteQuery from "../../../queries/SingleRouteQuery";
import {observable, action} from "mobx";
import {Button} from "../../Forms";
import Minus from "../../../icons/Minus";
import Plus from "../../../icons/Plus";

const JourneyPanelContent = styled.div`
  padding: 1rem 0;
  overflow-y: auto;
  overflow-x: visible;
`;

const JourneyStopsWrapper = styled.div`
  margin-left: 2.75rem;
  border-left: 3px ${({expanded}) => (expanded ? "solid" : "dotted")} var(--blue);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 1.5rem 0;
`;

const StopsList = styled.div`
  padding: 0 1.5rem;
  color: var(--light-grey);
`;

const JourneyExpandToggle = styled(Button).attrs({small: true})`
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  margin-left: auto;
  margin-right: 0.5rem;
  padding: 0;
  color: white;
  background: var(--blue);
`;

@withRoute
@withSelectedJourney
@inject(app("state"))
@observer
class JourneyDetails extends React.Component {
  @observable
  journeyIsExpanded = false;

  toggleJourneyExpanded = action((setTo = !this.journeyIsExpanded) => {
    this.journeyIsExpanded = setTo;
  });

  render() {
    const {
      state: {date, route: stateRoute},
      selectedJourneyHfp,
    } = this.props;
    const firstPosition = selectedJourneyHfp[0];

    if (!firstPosition || !stateRoute || !stateRoute.routeId) {
      return "Loading...";
    }

    const currentDayType = getDayTypeFromDate(date);

    console.log(pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd"));

    return (
      <SingleRouteQuery
        date={date}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          if (loading || error) {
            return "Loading...";
          }

          // Get the first departure of the journey from the origin stop departures
          const originDeparture =
            get(route, "originStop.departures.nodes", []).find(
              ({hours, minutes, dayType, routeId, direction, dateBegin, dateEnd}) =>
                `${doubleDigit(hours)}:${doubleDigit(minutes)}:00` ===
                  get(firstPosition, "journey_start_time", "") &&
                isWithinRange(date, dateBegin, dateEnd) &&
                dayType === currentDayType &&
                routeId === get(firstPosition, "route_id", "") &&
                parseInt(direction) ===
                  parseInt(get(firstPosition, "direction_id", 0))
            ) || {};

          const {dateBegin, dateEnd, departureId} = originDeparture;

          const journeyStops = sortBy(
            get(route, "routeSegments.nodes", []),
            "stopIndex"
          ).map((routeSegment) => {
            const stopDepartures = get(
              routeSegment,
              "stop.departures.nodes",
              []
            ).filter(
              (departure) =>
                departure.dateBegin === dateBegin &&
                departure.dateEnd === dateEnd &&
                departure.departureId === departureId
            );

            const {
              destinationFi,
              distanceFromPrevious,
              distanceFromStart,
              duration,
              stopIndex,
              timingStopType,
            } = routeSegment;
            const {nameFi, shortId, stopId} = get(routeSegment, "stop", {});

            return {
              destination: destinationFi,
              distanceFromPrevious,
              distanceFromStart,
              duration,
              stopIndex,
              timingStopType,
              stopName: nameFi,
              shortId,
              stopId,
              stopDeparture: stopDepartures[0],
            };
          });

          return (
            <>
              <JourneyDetailsHeader
                mode={get(route, "mode", "BUS")}
                routeId={get(route, "routeId", "")}
                desi={get(firstPosition, "desi")}
                name={get(route, "nameFi")}
              />
              <JourneyPanelContent>
                <TerminalStop
                  isFirstTerminal={true}
                  originDeparture={originDeparture}
                  stop={get(route, "originStop", {})}
                  journeyPositions={selectedJourneyHfp}
                  date={date}
                />
                <JourneyStopsWrapper expanded={this.journeyIsExpanded}>
                  <StopsList>{journeyStops.length} stops hidden</StopsList>
                  <JourneyExpandToggle onClick={() => this.toggleJourneyExpanded()}>
                    {this.journeyIsExpanded ? (
                      <Minus fill="white" width="0.75rem" height="0.75rem" />
                    ) : (
                      <Plus fill="white" width="0.75rem" height="0.75rem" />
                    )}
                  </JourneyExpandToggle>
                </JourneyStopsWrapper>
                <TerminalStop
                  isLastTerminal={true}
                  originDeparture={originDeparture}
                  stop={get(route, "destinationStop", {})}
                  journeyPositions={selectedJourneyHfp}
                  date={date}
                />
                <Equipment
                  observedVehicleId={get(firstPosition, "unique_vehicle_id", "")}
                />
              </JourneyPanelContent>
            </>
          );
        }}
      </SingleRouteQuery>
    );
  }
}
export default JourneyDetails;
