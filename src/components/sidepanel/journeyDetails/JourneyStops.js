import React from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import isWithinRange from "date-fns/is_within_range";
import TerminalStop from "./TerminalStop";
import doubleDigit from "../../../helpers/doubleDigit";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import styled from "styled-components";
import {Button} from "../../Forms";
import Minus from "../../../icons/Minus";
import Plus from "../../../icons/Plus";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";

const StopsWrapper = styled.div``;

const JourneyStopsWrapper = styled.div`
  margin-left: calc(2.5rem - 1px);
  border-left: 3px ${({expanded}) => (expanded ? "solid" : "dotted")}
    var(--light-grey);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 1.5rem 0;
`;

const StopsList = styled.div`
  padding: 0 1rem 0 1.5rem;
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

@observer
class JourneyStops extends React.Component {
  @observable
  journeyIsExpanded = false;

  toggleJourneyExpanded = action((setTo = !this.journeyIsExpanded) => {
    this.journeyIsExpanded = setTo;
  });

  render() {
    const {journeyHfp, route, date} = this.props;
    const currentDayType = getDayTypeFromDate(date);
    const firstPosition = journeyHfp[0];

    // Get the first departure of the journey from the origin stop departures
    const originDeparture =
      get(route, "originStop.departures.nodes", []).find(
        ({hours, minutes, dayType, routeId, direction, dateBegin, dateEnd}) =>
          `${doubleDigit(hours)}:${doubleDigit(minutes)}:00` ===
            get(firstPosition, "journey_start_time", "") &&
          isWithinRange(date, dateBegin, dateEnd) &&
          dayType === currentDayType &&
          routeId === get(firstPosition, "route_id", "") &&
          parseInt(direction) === parseInt(get(firstPosition, "direction_id", 0))
      ) || {};

    const {dateBegin, dateEnd, departureId} = originDeparture;

    const journeyStops = sortBy(
      get(route, "routeSegments.nodes", []),
      "stopIndex"
    ).map((routeSegment) => {
      const stopDepartures = get(routeSegment, "stop.departures.nodes", []).filter(
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
      <StopsWrapper>
        <TerminalStop
          isFirstTerminal={true}
          originDeparture={originDeparture}
          stop={get(route, "originStop", {})}
          journeyPositions={journeyHfp}
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
          journeyPositions={journeyHfp}
          date={date}
        />
      </StopsWrapper>
    );
  }
}

export default JourneyStops;
