import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import withHfpData from "../../hoc/withHfpData";
import map from "lodash/map";
import get from "lodash/get";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import {format, parse} from "date-fns";

@inject(app("Journey", "Time", "Filters"))
@withHfpData
@observer
class JourneyList extends Component {
  componentDidMount() {
    this.ensureSelectedVehicle();
  }

  componentDidUpdate() {
    this.ensureSelectedVehicle();
  }

  ensureSelectedVehicle = () => {
    const {Filters, state, positionsByJourney} = this.props;
    const {vehicle, selectedJourney} = state;

    if (!selectedJourney) {
      if (vehicle !== "") {
        Filters.setVehicle("");
      }

      return;
    }

    const selectedJourneyId = getJourneyId(selectedJourney);
    const journeys = map(positionsByJourney, ({positions}) => positions[0]);
    const journey = journeys.find((j) => getJourneyId(j) === selectedJourneyId);

    // Only set these if the journey is truthy and was not already selected
    if (journey && journey.unique_vehicle_id !== vehicle) {
      Filters.setVehicle(journey.unique_vehicle_id);
    }
  };

  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Time, Journey, state} = this.props;

    // Only set these if the journey is truthy and was not already selected
    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Time.setTime(journey.journey_start_time);
    }

    Journey.setSelectedJourney(journey);
  };

  getJourneyStartPosition(journeyId) {
    const {positionsByJourney} = this.props;

    // Get the hfp data for this journey
    const journeyPositions = get(
      positionsByJourney.find(({journeyId: jid}) => jid === journeyId),
      "positions",
      []
    );

    // Default to the first hfp event, ie when the data stream from this vehicle started
    let journeyStartHfp = journeyPositions[0];

    if (!journeyStartHfp) {
      return null;
    }

    for (let i = 1; i < journeyPositions.length; i++) {
      const current = journeyPositions[i];

      // Loop through the positions and find when the next_stop_id prop changes.
      // The hfp event BEFORE this is when the journey started, ie when
      // the vehicle departed the first terminal.
      if (current && current.next_stop_id !== journeyStartHfp.next_stop_id) {
        journeyStartHfp = journeyPositions[i - 1];
        break;
      }
    }

    return journeyStartHfp;
  }

  render() {
    const {positionsByJourney, state} = this.props;

    const journeys = map(positionsByJourney, ({positions}) => positions[0]);
    const selectedJourney = get(state, "selectedJourney");
    const selectedJourneyId = getJourneyId(selectedJourney);

    const isSelected = (journey) =>
      selectedJourney && selectedJourneyId === getJourneyId(journey);

    return (
      <div className="journey-list">
        <div className="journey-list-row header">
          <strong className="start-time">Planned start time</strong>
          <span>Real start time</span>
        </div>
        {journeys.map((journey) => {
          const journeyStartHfp = this.getJourneyStartPosition(
            getJourneyId(journey)
          );

          return (
            <button
              className={`journey-list-row ${isSelected(journey) ? "selected" : ""}`}
              key={`journey_row_${getJourneyId(journey)}`}
              onClick={this.selectJourney(journey)}>
              <strong className="start-time">{journey.journey_start_time}</strong>
              {journeyStartHfp && (
                <span>{format(parse(journeyStartHfp.received_at), "HH:mm:ss")}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
}

export default JourneyList;
