import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import getJourneyId from "../../helpers/getJourneyId";
import ToggleButton from "../ToggleButton";
import {areaEventsStyles} from "../../stores/UIStore";
import {text} from "../../helpers/text";
import {getNormalTime} from "../../helpers/time";

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

@inject(app("Journey", "Time", "UI"))
@observer
class AreaJourneyList extends Component {
  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Journey, state} = this.props;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        Journey.setSelectedJourney(journey);
      } else {
        Journey.setSelectedJourney(null);
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
            preLabel={text("sidepanel.area_events.show_lines")}
            label={text("sidepanel.area_events.show_markers")}
            checked={areaEventsStyle === areaEventsStyles.MARKERS}
            value={areaEventsStyle}
          />
        }>
        {(scrollRef) =>
          journeys.map((journey) => {
            const {routeId, direction, departureTime, id: journeyId} = journey;

            const journeyIsSelected = selectedJourney && selectedJourneyId === journeyId;

            return (
              <JourneyListRow
                ref={journeyIsSelected ? scrollRef : null}
                key={`area_event_row_${journeyId}`}
                selected={journeyIsSelected}
                onClick={this.selectJourney(journey)}>
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
}

export default AreaJourneyList;
