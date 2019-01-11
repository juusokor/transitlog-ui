import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import map from "lodash/map";
import getJourneyId from "../../helpers/getJourneyId";
import ToggleButton from "../ToggleButton";
import {areaEventsStyles} from "../../stores/UIStore";

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

@inject(app("Journey", "Time", "Filters", "UI"))
@observer
class AreaJourneyList extends Component {
  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Filters, Journey, state} = this.props;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        const route = {
          routeId: journey.route_id,
          direction: parseInt(journey.direction_id, 10),
        };

        Filters.setRoute(route);
        Journey.setSelectedJourney(journey);

        Journey.requestJourneys({
          time: journey.journey_start_time,
          route,
          date: journey.oday,
        });
      }
    }
  };

  onChangeDisplayStyle = (e) => {
    const {UI} = this.props;
    const value = e.target.value;

    UI.setAreaEventsStyle(
      value === areaEventsStyles.MARKERS
        ? areaEventsStyles.POLYLINES
        : areaEventsStyles.MARKERS
    );
  };

  render() {
    const {
      journeys,
      loading,
      state: {selectedJourney, areaEventsStyle},
    } = this.props;

    const journeyHfpEvents = map(journeys, ({journeyId, events}) => ({
      journeyId,
      position: events[0],
    }));

    const selectedJourneyId = getJourneyId(selectedJourney);

    return (
      <SidepanelList
        loading={loading}
        header={
          <ToggleButton
            type="checkbox"
            onChange={this.onChangeDisplayStyle}
            name="area_events_style"
            isSwitch={true}
            preLabel="Show as heatmap"
            label="Show as markers"
            checked={areaEventsStyle === areaEventsStyles.MARKERS}
            value={areaEventsStyle}
          />
        }>
        {(scrollRef) =>
          journeyHfpEvents.map(({journeyId, position}) => {
            const {route_id, direction_id, journey_start_time} = position;

            const journeyIsSelected =
              selectedJourney && selectedJourneyId === journeyId;

            return (
              <JourneyListRow
                ref={journeyIsSelected ? scrollRef : null}
                key={`area_event_row_${journeyId}`}
                selected={journeyIsSelected}
                onClick={this.selectJourney(position)}>
                <JourneyRowLeft>
                  {route_id} / {direction_id}
                </JourneyRowLeft>
                <span>{journey_start_time}</span>
              </JourneyListRow>
            );
          })
        }
      </SidepanelList>
    );
  }
}

export default AreaJourneyList;
