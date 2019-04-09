import React from "react";
import {observer} from "mobx-react";
import styled from "styled-components";
import JourneyStop from "./JourneyStop";
import {Text} from "../../../helpers/text";

const JourneyStopsWrapper = styled.div`
  margin-left: ${({expanded}) => (expanded ? "0" : "calc(1.5rem - 1px)")};
  border-left: ${({expanded}) => (expanded ? "0" : "3px dotted var(--light-grey)")};
  padding: ${({expanded}) => (expanded ? "0" : "1.5rem 0")};
  position: relative;
`;

const StopsList = styled.div`
  padding: 0 0.5rem 0 0.5rem;
  width: 100%;
  color: var(--light-grey);
`;

const HiddenStopsMessage = styled.span`
  padding-left: 1.5rem;
`;

const JourneyExpandToggle = styled.button`
  position: absolute;
  top: ${({expanded}) => (expanded ? "-1.75rem" : "0.875rem")};
  left: 0;
  padding: 0;
  padding-left: ${({expanded}) => (expanded ? "1.5rem" : "0")};
  background: transparent;
  border: 0;
  font-family: inherit;
  color: white;
  text-decoration: underline dashed;
  color: var(--blue);
  transition: transform 0.1s ease-out;
  cursor: pointer;
  outline: none;
  text-align: left;
  width: auto;

  &:hover {
    transform: scale(1.025);
  }
`;

@observer
class JourneyStops extends React.Component {
  render() {
    const {
      departures = [],
      date,
      color,
      onClickTime,
      stopsExpanded,
      toggleStopsExpanded,
      onSelectStop,
      onHoverStop,
    } = this.props;

    return (
      <JourneyStopsWrapper expanded={stopsExpanded}>
        <JourneyExpandToggle
          expanded={stopsExpanded}
          onClick={() => toggleStopsExpanded()}>
          {stopsExpanded ? (
            <HiddenStopsMessage>Hide stops</HiddenStopsMessage>
          ) : (
            <HiddenStopsMessage>
              {departures.length} <Text>journey.stops_hidden</Text>
            </HiddenStopsMessage>
          )}
        </JourneyExpandToggle>
        <StopsList>
          {stopsExpanded &&
            departures.map((departure) => (
              <JourneyStop
                key={`journey_stop_${departure.stopId}_${departure.stopIndex}`}
                onHoverStop={onHoverStop}
                onSelectStop={onSelectStop}
                departure={departure}
                date={date}
                color={color}
                onClickTime={onClickTime}
              />
            ))}
        </StopsList>
      </JourneyStopsWrapper>
    );
  }
}

export default JourneyStops;
