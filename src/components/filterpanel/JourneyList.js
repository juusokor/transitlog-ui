import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import withHfpData from "../../hoc/withHfpData";
import map from "lodash/map";
import get from "lodash/get";
import {app} from "mobx-app";

@inject(app("Journey", "Time", "Filters"))
@withHfpData
@observer
class JourneyList extends Component {
  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Time, Journey, Filters} = this.props;

    Journey.setSelectedJourney(journey);
    Time.setTime(journey.journeyStartTime);
    Filters.setVehicle(journey.uniqueVehicleId);
  };

  render() {
    const {positionsByJourney, state} = this.props;

    const journeys = map(positionsByJourney, ({positions, journeyStartTime}) => {
      const pos = positions[0];

      return {
        jrn: pos.jrn,
        journeyStartTime: journeyStartTime,
        uniqueVehicleId: pos.uniqueVehicleId,
        oday: pos.oday,
      };
    });

    const selectedJourney = get(state, "selectedJourney");
    const isSelected = (journey) =>
      get(selectedJourney, "oday") === get(journey, "oday") &&
      get(selectedJourney, "jrn") === get(journey, "jrn");

    return (
      <div className="journey-list">
        {journeys.map((journey) => (
          <button
            className={`journey-list-row ${isSelected(journey) ? "selected" : ""}`}
            key={journey.jrn}
            onClick={this.selectJourney(journey)}>
            <strong className="start-time">{journey.journeyStartTime}</strong>
            <span className="vehicle-id">{journey.uniqueVehicleId}</span>
          </button>
        ))}
      </div>
    );
  }
}

export default JourneyList;
