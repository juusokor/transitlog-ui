import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import styled, {css} from "styled-components";
import JourneyStop from "./JourneyStop";
import {Text} from "../../../helpers/text";
import OriginStop from "./OriginStop";
import DestinationStop from "./DestinationStop";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import compact from "lodash/compact";
import {inject} from "../../../helpers/inject";
import ToggleView from "../../ToggleView";
import CancellationItem from "../../CancellationItem";
import {StopElementsWrapper, StopWrapper} from "../../StopElements";
import CrossThick from "../../../icons/CrossThick";
import {getCancellationKey} from "../../../helpers/getAlertKey";
import CircleCheckmark from "../../../icons/CircleCheckmark";

const StopsListWrapper = styled.div`
  padding: 1rem 0;
`;

const StopsList = styled.div`
  padding: 0 0.5rem 0 0;
  width: 100%;
  color: var(--light-grey);
`;

const HiddenStopsMessage = styled.div`
  padding: 0 0 1rem 1.5rem;
  margin-left: calc(1.25rem - 1.5px);
  border-left: ${({expanded, color = "var(--blue)"}) =>
    expanded ? `3px solid ${color}` : "3px dotted var(--light-grey)"};
  transform: none !important;
`;

const ExpandingStops = styled(ToggleView)`
  margin-left: 0;
  border-left: 0;
`;

const CancellationWrapper = styled(StopWrapper)`
  padding: 0;
  width: auto;

  ${StopElementsWrapper} {
    margin-right: 0.5rem;

    svg {
      margin-top: 0.75rem;
    }
  }

  ${({isFirst = false}) =>
    isFirst
      ? css`
          ${StopElementsWrapper} {
            margin-top: 1.5rem;

            svg {
              margin-top: -0.72rem;
            }
          }
        `
      : ""}
`;

const StopCancellation = styled(CancellationItem)`
  background: transparent !important;
  width: 100%;
  margin-bottom: 0.75rem;
  border-bottom: 0;
`;

const CancellationTimelineItem = observer(({cancellation, isFirst}) => (
  <CancellationWrapper isFirst={isFirst}>
    <StopElementsWrapper>
      {cancellation.isCancelled ? (
        <CrossThick fill="var(--red)" width="1rem" />
      ) : (
        <CircleCheckmark fill={{outer: "var(--green)"}} width="1.2rem" />
      )}
    </StopElementsWrapper>
    <StopCancellation
      timestampInHeader={true}
      noIcon={true}
      cancellation={cancellation}
    />
  </CancellationWrapper>
));

const decorate = flow(
  observer,
  inject("Time", "Filters", "UI")
);

const JourneyStops = decorate(
  ({departures = [], date, color, Filters, UI, Time, cancellations}) => {
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

    const departuresAndCancellations = orderBy(
      compact([...departures, cancellations[0]]),
      (item) => {
        const time = get(
          item,
          "observedDepartureTime.departureDateTime",
          get(
            item,
            "plannedDepartureTime.departureDateTime",
            get(item, "lastModifiedDateTime", null)
          )
        );

        if (time) {
          return new Date(time).valueOf();
        }

        return 0;
      },
      "ASC"
    );

    const firstItem = departuresAndCancellations[0];
    const lastItem = departuresAndCancellations[departures.length - 1];

    if (!firstItem) {
      return null;
    }

    return (
      <StopsListWrapper>
        {get(firstItem, "lastModifiedDateTime") ? (
          <CancellationTimelineItem isFirst={true} cancellation={firstItem} />
        ) : (
          <OriginStop
            onHoverStop={onHoverStop}
            onSelectStop={onSelectStop}
            departure={firstItem}
            color={color}
            date={date}
            onClickTime={onClickTime}
          />
        )}
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
            {departuresAndCancellations.slice(1, -1).map((departureOrCancellation) => {
              if (
                departureOrCancellation &&
                departureOrCancellation.lastModifiedDateTime
              ) {
                return (
                  <CancellationTimelineItem
                    key={getCancellationKey(departureOrCancellation)}
                    cancellation={departureOrCancellation}
                  />
                );
              }

              if (!departureOrCancellation || !departureOrCancellation.stop) {
                return null;
              }

              return (
                <JourneyStop
                  key={`journey_stop_${departureOrCancellation.stopId}_${
                    departureOrCancellation.stopIndex
                  }`}
                  onHoverStop={onHoverStop}
                  onSelectStop={onSelectStop}
                  departure={departureOrCancellation}
                  date={date}
                  color={color}
                  onClickTime={onClickTime}
                />
              );
            })}
          </StopsList>
        </ExpandingStops>
        {lastItem.lastModifiedDateTime ? (
          <CancellationTimelineItem cancellation={lastItem} />
        ) : (
          <DestinationStop
            onHoverStop={onHoverStop}
            onSelectStop={onSelectStop}
            departure={lastItem}
            date={date}
            color={color}
            onClickTime={onClickTime}
          />
        )}
      </StopsListWrapper>
    );
  }
);

export default JourneyStops;
