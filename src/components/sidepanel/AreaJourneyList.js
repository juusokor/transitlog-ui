import React, {useCallback, useState, useMemo} from "react";
import {observer, Observer} from "mobx-react-lite";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import getJourneyId from "../../helpers/getJourneyId";
import ToggleButton from "../ToggleButton";
import {areaEventsStyles} from "../../stores/UIStore";
import {text} from "../../helpers/text";
import {getNormalTime} from "../../helpers/time";
import Input from "../Input";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) =>
    selected ? "var(--blue)" : "rgba(0, 0, 0, 0.025)"};
  padding: 0.75rem 1rem;
  border: 0;
  max-width: none;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  color: ${({selected = false}) => (selected ? "white" : "var(--grey)")};
  outline: none;

  &:nth-child(odd) {
    background: ${({selected = false}) =>
      selected ? "var(--blue)" : "rgba(255, 255, 255, 0.025)"};
  }
`;

const JourneyRowLeft = styled.span`
  display: block;
  font-weight: bold;
  min-width: 6rem;
  text-align: left;
`;

const TimeSlot = styled.span`
  font-size: 0.857rem;
  font-family: "Courier New", Courier, monospace;
  min-width: 5rem;
  text-align: right;
`;

const ListHeader = styled.div``;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const TimetableFilters = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-end;
`;

const RouteFilterContainer = styled.div`
  flex: 1 1 50%;

  label {
    font-size: 0.75rem;
  }
`;

const decorate = flow(
  observer,
  inject("Journey", "Time", "UI")
);

const AreaJourneyList = decorate(
  ({
    journeys,
    loading,
    Journey,
    UI,
    state: {selectedJourney, areaEventsStyle, areaEventsRouteFilter},
  }) => {
    const selectedJourneyId = useMemo(() => getJourneyId(selectedJourney), [
      selectedJourney,
    ]);

    const selectJourney = useCallback(
      (journey) => {
        if (journey) {
          const journeyId = getJourneyId(journey);

          // Only set these if the journey is truthy and was not already selected
          if (journeyId && selectedJourneyId !== journeyId) {
            Journey.setSelectedJourney(journey);
          } else {
            Journey.setSelectedJourney(null);
          }
        }
      },
      [selectedJourneyId]
    );

    const onChangeDisplayStyle = useCallback((e) => {
      const value = e.target.value;

      UI.setAreaEventsStyle(
        value === areaEventsStyles.MARKERS
          ? areaEventsStyles.POLYLINES
          : areaEventsStyles.MARKERS
      );
    }, []);

    const onChangeAreaEventsFilter = useCallback((e) => {
      const value = e.target.value;
      UI.setAreaEventsRouteFilter(value);
    }, []);

    let journeyList = journeys;

    if (areaEventsRouteFilter) {
      const routes = areaEventsRouteFilter.split(",").map((r) => r.trim());
      journeyList = journeys.filter(({routeId}) =>
        routes.some((r) => routeId.includes(r))
      );
    }

    return (
      <SidepanelList
        focusKey={selectedJourneyId}
        loading={loading}
        header={
          <Observer>
            {() => (
              <ListHeader>
                <HeaderRow>
                  <ToggleButton
                    type="checkbox"
                    onChange={onChangeDisplayStyle}
                    name="area_events_style"
                    isSwitch={true}
                    preLabel={text("sidepanel.area_events.show_lines")}
                    label={text("sidepanel.area_events.show_markers")}
                    checked={areaEventsStyle === areaEventsStyles.MARKERS}
                    value={areaEventsStyle}
                  />
                </HeaderRow>
                <HeaderRow>
                  <TimetableFilters>
                    <RouteFilterContainer>
                      <Input
                        value={areaEventsRouteFilter}
                        animatedLabel={false}
                        onChange={onChangeAreaEventsFilter}
                        label={text("domain.route")}
                      />
                    </RouteFilterContainer>
                  </TimetableFilters>
                </HeaderRow>
              </ListHeader>
            )}
          </Observer>
        }>
        {(scrollRef) =>
          journeyList.map((journey) => {
            const {routeId, direction, departureTime, id: journeyId} = journey;
            const journeyIsSelected = selectedJourney && selectedJourneyId === journeyId;

            return (
              <JourneyListRow
                ref={journeyIsSelected ? scrollRef : null}
                key={`area_event_row_${journeyId}`}
                selected={journeyIsSelected}
                onClick={() => selectJourney(journey)}>
                <JourneyRowLeft>
                  {routeId} / {direction}
                </JourneyRowLeft>
                <TimeSlot>{getNormalTime(departureTime)}</TimeSlot>
              </JourneyListRow>
            );
          })
        }
      </SidepanelList>
    );
  }
);

export default AreaJourneyList;
