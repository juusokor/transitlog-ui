import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import JourneyStop from "./JourneyStop";
import {Text} from "../../../helpers/text";
import OriginStop from "./OriginStop";
import DestinationStop from "./DestinationStop";
import flow from "lodash/flow";
import {inject} from "../../../helpers/inject";
import ToggleView from "../../ToggleView";

const StopsListWrapper = styled.div`
  padding: 1rem 0 1rem;
`;

const StopsList = styled.div`
  padding: 0 0.5rem 0 0.5rem;
  width: 100%;
  color: var(--light-grey);
`;

const HiddenStopsMessage = styled.div`
  padding: 0 0 1rem 1.5rem;
  margin-left: calc(1.5rem - 1.5px);
  border-left: ${({expanded, color = "var(--blue)"}) =>
    expanded ? `3px solid ${color}` : "3px dotted var(--light-grey)"};
`;

const ExpandingStops = styled(ToggleView)`
  margin-left: 0;
  border-left: 0;
`;

const decorate = flow(
  observer,
  inject("Time", "Filters", "UI")
);

const JourneyStops = decorate(({departures = [], date, color, Filters, UI, Time}) => {
  const onClickTime = useCallback(
    (time) => {
      Time.setTime(time);
    },
    [Time]
  );

  const onSelectStop = useCallback(
    (stopId) => {
      if (stopId) {
        Filters.setStop(stopId);
      }
    },
    [Filters]
  );

  const onHoverStop = useCallback(
    (stopId) => {
      UI.highlightStop(stopId);
    },
    [UI]
  );

  return (
    <StopsListWrapper>
      <OriginStop
        onHoverStop={onHoverStop}
        onSelectStop={onSelectStop}
        departure={departures[0]}
        color={color}
        date={date}
        onClickTime={onClickTime}
      />
      <ExpandingStops
        closedLabel={
          <HiddenStopsMessage color={color} expanded={false}>
            {departures.length} <Text>journey.stops_hidden</Text>
          </HiddenStopsMessage>
        }
        openLabel={
          <HiddenStopsMessage color={color} expanded={true}>
            Hide stops
          </HiddenStopsMessage>
        }>
        <StopsList>
          {departures.slice(1, -1).map((departure) => {
            if (!departure || !departure.stop) {
              return null;
            }

            return (
              <JourneyStop
                key={`journey_stop_${departure.stopId}_${departure.stopIndex}`}
                onHoverStop={onHoverStop}
                onSelectStop={onSelectStop}
                departure={departure}
                date={date}
                color={color}
                onClickTime={onClickTime}
              />
            );
          })}
        </StopsList>
      </ExpandingStops>
      <DestinationStop
        onHoverStop={onHoverStop}
        onSelectStop={onSelectStop}
        departure={departures[departures.length - 1]}
        date={date}
        color={color}
        onClickTime={onClickTime}
      />
    </StopsListWrapper>
  );
});

export default JourneyStops;
