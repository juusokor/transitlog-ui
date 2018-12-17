import React from "react";
import {Heading} from "../../Typography";
import Cross from "../../../icons/Cross";
import styled from "styled-components";
import {observer} from "mobx-react";
import withSelectedJourney from "../../../hoc/withSelectedJourney";
import withRouteData from "../../../hoc/withRouteData";
import get from "lodash/get";
import omit from "lodash/omit";
import {getDayTypeFromDate} from "../../../helpers/getDayTypeFromDate";
import isWithinRange from "date-fns/is_within_range";
import {TransportIcon} from "../../transportModes";
import TerminalStop from "./TerminalStop";
import doubleDigit from "../../../helpers/doubleDigit";

const JourneyPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 1rem;
`;

const JourneyPanelCloseButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  transition: background 0.1s ease-out, transform 0.1s ease-out;
  cursor: pointer;
  margin-left: auto;
  margin-right: 1px;
  margin-top: 1px;
  outline: 0;

  svg {
    transition: color 0.1s ease-out;
  }

  &:hover {
    background: var(--lightest-grey);
    transform: scale(1.05);

    svg {
      fill: white;
    }
  }
`;

const LineNameHeading = styled(Heading).attrs({level: 4})`
  font-weight: normal;
`;

const JourneyPanelContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  overflow-x: visible;
`;

const HeaderHeading = styled.div`
  margin-top: 0.75rem;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }
`;

@withSelectedJourney
@withRouteData
@observer
class JourneyDetails extends React.Component {
  render() {
    const {onToggle, selectedJourneyHfp, date, route} = this.props;

    const firstPosition = selectedJourneyHfp[0];
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
          <HeaderHeading>
            <Heading level={3}>
              <TransportIcon width={23} height={23} mode={route.mode} />
              {firstPosition.desi}
            </Heading>
            <LineNameHeading>{route.nameFi}</LineNameHeading>
          </HeaderHeading>
          <JourneyPanelCloseButton onClick={() => onToggle()}>
            <Cross fill="var(--blue)" width="1.25rem" height="1.25rem" />
          </JourneyPanelCloseButton>
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
