import React from "react";
import {Heading} from "../../Typography";
import styled from "styled-components";
import {observer} from "mobx-react";
import withSelectedJourney from "../../../hoc/withSelectedJourney";
import withRouteData from "../../../hoc/withRouteData";
import get from "lodash/get";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import isWithinRange from "date-fns/is_within_range";
import {TransportIcon} from "../../transportModes";
import TerminalStop from "./TerminalStop";
import doubleDigit from "../../../helpers/doubleDigit";

const JourneyPanelHeader = styled.div`
  padding: 1rem 1rem 0 1.75rem;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  svg {
    margin-left: -0.2rem;
    margin-right: 0.5rem;
  }
`;

const LineNameHeading = styled(Heading).attrs({level: 4})`
  font-weight: normal;
`;

const JourneyPanelContent = styled.div`
  padding: 1rem 1rem 1rem 2rem;
  overflow-y: auto;
  overflow-x: visible;
`;

@withSelectedJourney
@withRouteData
@observer
class JourneyDetails extends React.Component {
  render() {
    const {selectedJourneyHfp, date, route} = this.props;
    const firstPosition = selectedJourneyHfp[0];

    if (!firstPosition) {
      return null;
    }

    const line = get(route, "line.nodes[0].lineId");
    const currentDayType = getDayTypeFromDate(date);

    /*const routeDepartures = get(route, "departures.nodes", []).filter(
      ({currentDayType: departureDayType, dateBegin, dateEnd}) =>
        (Array.isArray(departureDayType)
          ? departureDayType.indexOf(currentDayType) !== -1
          : departureDayType === currentDayType) && isWithinRange(date, dateBegin, dateEnd)
    );*/

    // Get the first departure of the journey from the origin stop departures
    const originDeparture = get(route, "originStop.departures.nodes").find(
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
        <JourneyPanelHeader>
          <Heading level={3}>
            <TransportIcon width={23} height={23} mode={route.mode} />
            {firstPosition.desi}
          </Heading>
          <LineNameHeading>{route.nameFi}</LineNameHeading>
        </JourneyPanelHeader>
        <JourneyPanelContent>
          <TerminalStop
            originDeparture={originDeparture}
            stop={route.originStop}
            stopName="Origin stop"
            journeyPositions={selectedJourneyHfp}
            date={date}
          />
          <TerminalStop
            originDeparture={originDeparture}
            stop={route.destinationStop}
            stopName="Destination stop"
            journeyPositions={selectedJourneyHfp}
            date={date}
          />
        </JourneyPanelContent>
      </>
    );
  }
}

export default JourneyDetails;
