import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import withHfpData from "../../hoc/withHfpData";
import map from "lodash/map";
import {app} from "mobx-app";

@inject(app("Journey", "Time"))
@withHfpData
@observer
class JourneyList extends Component {
  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Time, Journey} = this.props;

    Journey.setSelectedJourney(journey);
    Time.setTime(journey.journeyStartTime);
  };

  render() {
    const {positionsByJourney} = this.props;

    const journeys = map(positionsByJourney, ({positions}, journeyId) => {
      const pos = positions[0];

      return {
        jrn: journeyId,
        journeyStartTime: pos.journeyStartTime,
        uniqueVehicleId: pos.uniqueVehicleId,
        oday: pos.oday,
      };
    });

    return (
      <div className="journey-list">
        {journeys.map((journey) => (
          <button
            className="journey-list-row"
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
