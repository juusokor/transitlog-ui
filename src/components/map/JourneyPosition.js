import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import getJourneyId from "../../helpers/getJourneyId";
import get from "lodash/get";
import getCoarsePositionForTime from "../../helpers/getCoarsePositionForTime";
import {latLng} from "leaflet";
import {app} from "mobx-app";

let prevJourneyKey = "";
let prevTime = "";
let followSelectedJourney = false;

@inject(app("state"))
@observer
class JourneyPosition extends Component {
  getJourneyPosition = () => {
    const {
      state: {selectedJourney, date, time},
      positions = [],
    } = this.props;

    let journeyPosition = null;

    if (selectedJourney) {
      const journeyId = getJourneyId(selectedJourney);
      const timeDate = new Date(`${date}T${time}`);

      const journeyPositions = get(
        positions.find((j) => j.journeyId === journeyId),
        "positions",
        []
      );

      const pos = getCoarsePositionForTime(journeyPositions, timeDate, journeyId);

      if (pos) {
        journeyPosition = latLng([pos.lat, pos.long]);
      }
    }

    return journeyPosition;
  };

  render() {
    const {state, children, positions} = this.props;
    const {time, selectedJourney} = state;

    let journeyPosition;
    const selectedJourneyId = getJourneyId(selectedJourney);

    /*
    The idea here is to make the map center follow the HFP marker ONLY IF
    the current journey hasn't changed. These conditionals need to be
    in this exact order for this to work, otherwise the map may
    recenter when changing journeys.
     */

    // 1. Change the journey key when the selected journey changes.
    if (
      !prevJourneyKey ||
      (selectedJourneyId && prevJourneyKey !== selectedJourneyId)
    ) {
      prevJourneyKey = selectedJourneyId;
      followSelectedJourney = false;
      prevTime = time;
    } else if (!selectedJourney) {
      prevJourneyKey = "";
    }

    // 2. Allow following the selected journey if the journey ID is the same
    // BUT the time has changed.
    if (
      (positions.length !== 0,
      !!prevJourneyKey && prevJourneyKey === selectedJourneyId && prevTime !== time)
    ) {
      followSelectedJourney = true;
    }

    // 3. If following is allowed, do that.
    if (followSelectedJourney) {
      journeyPosition = this.getJourneyPosition();
      prevTime = time;
    }

    return children(journeyPosition);
  }
}

export default JourneyPosition;
