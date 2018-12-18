import React from "react";
import styled from "styled-components";
import withSelectedJourney from "../../../hoc/withSelectedJourney";
import get from "lodash/get";
import flow from "lodash/flow";
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
import SingleRouteQuery from "../../../queries/SingleRouteQuery";

const JourneyPanelContent = styled.div`
  padding: 1rem 0;
  overflow-y: auto;
  overflow-x: visible;
`;

const decorate = flow(
  observer,
  inject(app("state")),
  withSelectedJourney,
  withRoute
);

const JourneyDetails = decorate(
  ({state: {date, route: stateRoute}, selectedJourneyHfp}) => {
    const firstPosition = selectedJourneyHfp[0];

    if (!firstPosition) {
      return "Loading...";
    }

    const currentDayType = getDayTypeFromDate(date);

    return (
      <SingleRouteQuery
        date={date}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          if (loading || error) {
            return "Loading...";
          }

          // Get the first departure of the journey from the origin stop departures
          const originDeparture = get(route, "originStop.departures.nodes", []).find(
            ({hours, minutes, dayType, routeId, direction, dateBegin, dateEnd}) =>
              `${doubleDigit(hours)}:${doubleDigit(minutes)}:00` ===
                get(firstPosition, "journey_start_time", "") &&
              isWithinRange(date, dateBegin, dateEnd) &&
              dayType === currentDayType &&
              routeId === get(firstPosition, "route_id", "") &&
              parseInt(direction) === parseInt(get(firstPosition, "direction_id", 0))
          );

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
                  originDeparture={originDeparture}
                  stop={get(route, "originStop", {})}
                  stopName="Origin stop"
                  journeyPositions={selectedJourneyHfp}
                  date={date}
                />
                <TerminalStop
                  originDeparture={originDeparture}
                  stop={get(route, "destinationStop", {})}
                  stopName="Destination stop"
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
);

export default JourneyDetails;
