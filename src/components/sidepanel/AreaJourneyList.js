import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import SidepanelList from "./SidepanelList";
import styled from "styled-components";
import map from "lodash/map";
import {journeyFetchStates} from "../../stores/JourneyStore";
import {text} from "../../helpers/text";
import Loading from "../Loading";
import getJourneyId from "../../helpers/getJourneyId";
import {timeToFormat} from "../../helpers/time";
import {centerSort} from "../../helpers/centerSort";
import {departuresToTimes} from "../../helpers/departuresToTimes";

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

@inject(app("Journey", "Time", "Filters"))
@observer
class AreaJourneyList extends Component {
  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Journey, state} = this.props;
    let journeyToSelect = null;

    if (journey) {
      const journeyId = getJourneyId(journey);

      // Only set these if the journey is truthy and was not already selected
      if (journeyId && getJourneyId(state.selectedJourney) !== journeyId) {
        journeyToSelect = journey;
        Journey.requestJourneys(journey.journey_start_time);
      }
    }

    Journey.setSelectedJourney(journeyToSelect);
  };

  render() {
    const {
      journeys,
      state: {selectedJourney},
    } = this.props;

    const journeyHfpEvents = map(journeys, ({journeyId, positions}) => ({
      journeyId,
      position: positions[0],
    }));

    const selectedJourneyId = getJourneyId(selectedJourney);

    return (
      <SidepanelList header={<span>header</span>}>
        {journeyHfpEvents.map(({journeyId, position}) => {
          const {route_id, direction_id, journey_start_time} = position;

          const journeyIsSelected =
            selectedJourney && selectedJourneyId === journeyId;

          return (
            <JourneyListRow
              key={`area_event_row_${journeyId}`}
              selected={journeyIsSelected}
              onClick={this.selectJourney(position)}>
              <JourneyRowLeft>
                {route_id} / {direction_id}
              </JourneyRowLeft>
              <span>{journey_start_time}</span>
            </JourneyListRow>
          );
        })}
      </SidepanelList>
    );
  }
}

export default AreaJourneyList;
