import React from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import omit from "lodash/omit";
import styled from "styled-components";
import {Button} from "../../Forms";
import Minus from "../../../icons/Minus";
import Plus from "../../../icons/Plus";
import JourneyStop from "./JourneyStop";
import {Text} from "../../../helpers/text";

const JourneyStopsWrapper = styled.div`
  margin-left: ${({expanded}) => (expanded ? "0" : "calc(1.5rem - 1px)")};
  border-left: ${({expanded}) => (expanded ? "0" : "3px dotted var(--light-grey)")};
  padding: ${({expanded}) => (expanded ? "0" : "1rem 0")};
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
`;

const StopsList = styled.div`
  padding: 0 0.5rem 0 0.5rem;
  width: 100%;
  color: var(--light-grey);
`;

const HiddenStopsMessage = styled.span`
  padding-left: 0.875rem;
`;

const JourneyExpandToggle = styled(Button).attrs({small: true})`
  box-sizing: content-box;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  color: white;
  background: var(--blue);
  position: fixed;
  transform: translateX(
    ${({isExpanded = false}) => (isExpanded ? "22.2rem" : "21.5rem")}
  );
  transition: border-width 0.1s ease-out;
  border: 0 solid var(--blue);

  &:hover {
    background: var(--blue);
    color: white;
    border-width: 1px;
    transform: translateX(
      ${({isExpanded = false}) => (isExpanded ? "22.2rem" : "21.5rem")}
    );
  }
`;

@observer
class JourneyStops extends React.Component {
  @observable
  journeyIsExpanded = false;

  toggleJourneyExpanded = action((setTo = !this.journeyIsExpanded) => {
    this.journeyIsExpanded = setTo;
  });

  render() {
    const {journeyHfp, route, date, originDeparture, onClickTime} = this.props;
    const {dateBegin = "", dateEnd = "", departureId = 0} = originDeparture || {};

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

      return {
        destination: routeSegment.destinationFi,
        distanceFromPrevious: routeSegment.distanceFromPrevious,
        distanceFromStart: routeSegment.distanceFromStart,
        duration: routeSegment.duration,
        stopIndex: routeSegment.stopIndex,
        timingStopType: routeSegment.timingStopType,
        ...omit(get(routeSegment, "stop", {}), "departures", "__typename"),
        stopDeparture: stopDepartures[0],
      };
    });

    return (
      <JourneyStopsWrapper expanded={this.journeyIsExpanded}>
        <StopsList>
          {this.journeyIsExpanded ? (
            journeyStops
              .slice(1, journeyStops.length - 1)
              .map((journeyStop) => (
                <JourneyStop
                  key={`journey_stop_${journeyStop.stopId}_${journeyStop.stopIndex}`}
                  stop={journeyStop}
                  originDeparture={originDeparture}
                  date={date}
                  journeyPositions={journeyHfp}
                  onClickTime={onClickTime}
                />
              ))
          ) : (
            <HiddenStopsMessage>
              {journeyStops.length - 2} <Text>journey.stops_hidden</Text>
            </HiddenStopsMessage>
          )}
        </StopsList>
        <JourneyExpandToggle
          isExpanded={this.journeyIsExpanded}
          onClick={() => this.toggleJourneyExpanded()}>
          {this.journeyIsExpanded ? (
            <Minus fill="white" width="0.75rem" height="0.75rem" />
          ) : (
            <Plus fill="white" width="0.75rem" height="0.75rem" />
          )}
        </JourneyExpandToggle>
      </JourneyStopsWrapper>
    );
  }
}

export default JourneyStops;
