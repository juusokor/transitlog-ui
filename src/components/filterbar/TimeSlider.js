import React, {Component} from "react";
import moment from "moment-timezone";
import {observer, inject} from "mobx-react";
import {action, observable, reaction, computed} from "mobx";
import {app} from "mobx-app";
import RangeInput from "../RangeInput";
import {
  dateToSeconds,
  getTimeRangeFromPositions,
} from "../../helpers/getTimeRangeFromPositions";
import getJourneyId from "../../helpers/getJourneyId";
import get from "lodash/get";

export const TIME_SLIDER_MAX = 86400;
export const TIME_SLIDER_MIN = 0;

@inject(app("Time", "UI"))
@observer
class TimeSlider extends Component {
  getNumericValueFromTime = (time = "") => {
    const [hours = 0, minutes = 0, seconds = 0] = time.split(":");
    const num = (val) => parseInt(val, 10);
    return num(seconds) + num(minutes) * 60 + num(hours) * 60 * 60;
  };

  onChange = action((e) => {
    const {Time, state} = this.props;
    const {live} = state;

    const value = parseInt(get(e, "target.value", 0), 10);

    if (live) {
      Time.toggleLive(false);
    }

    Time.setSeconds(value);
  });

  getRange = () => {
    const {
      positions,
      timeRange,
      state: {selectedJourney, route},
    } = this.props;

    if ((!route || !route.routeId) && timeRange) {
      const operationDay = timeRange.min.clone().startOf("day");

      return {
        min: dateToSeconds(timeRange.min, operationDay),
        max: dateToSeconds(timeRange.max, operationDay),
      };
    }

    const selectedJourneyId = getJourneyId(selectedJourney);
    let selectedJourneyPositions = [];

    if (selectedJourneyId && positions.length !== 0) {
      selectedJourneyPositions = get(
        positions.find(({journeyId}) => journeyId === selectedJourneyId),
        "events",
        []
      );

      return getTimeRangeFromPositions(selectedJourneyPositions);
    }

    return {min: TIME_SLIDER_MIN, max: TIME_SLIDER_MAX};
  };

  render() {
    const {className, state} = this.props;
    const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = this.getRange();

    const sliderValue = this.getNumericValueFromTime(state.time);

    return (
      <div className={className}>
        <RangeInput
          value={sliderValue}
          min={Math.min(sliderValue, min)}
          max={Math.max(sliderValue, max)}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TimeSlider;
