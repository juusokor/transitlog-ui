import React from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import styled from "styled-components";
import {Button} from "../../Forms";
import Minus from "../../../icons/Minus";
import Plus from "../../../icons/Plus";
import JourneyStop from "./JourneyStop";

const JourneyStopsWrapper = styled.div`
  margin-left: ${({expanded}) => (expanded ? "0" : "calc(2.5rem - 1px)")};
  border-left: ${({expanded}) => (expanded ? "0" : "3px dotted var(--light-grey)")};
  padding: ${({expanded}) => (expanded ? "0" : "1rem 0")};
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
`;

const StopsList = styled.div`
  padding: 0 1rem 0 1.5rem;
  color: var(--light-grey);
`;

const JourneyExpandToggle = styled(Button).attrs({small: true})`
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  color: white;
  background: var(--blue);
  position: absolute;
  top: 0.75rem;
  right: 0.5rem;
  border: 0;

  &:hover {
    background: var(--blue);
    color: white;
    border: 0;
    transform: scale(1.1);
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

      const {nameFi, shortId, stopId, modes} = get(routeSegment, "stop", {});

      return {
        destination: destinationFi,
        distanceFromPrevious,
        distanceFromStart,
        duration,
        stopIndex,
        timingStopType,
        nameFi,
        shortId,
        stopId,
        modes,
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
            <>{journeyStops.length - 2} stops hidden</>
          )}
        </StopsList>
        <JourneyExpandToggle onClick={() => this.toggleJourneyExpanded()}>
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
