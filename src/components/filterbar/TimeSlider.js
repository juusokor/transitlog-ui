import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import RangeInput from "../RangeInput";
import {getTimeRangeFromPositions} from "../../helpers/getTimeRangeFromPositions";
import get from "lodash/get";
import {timeToSeconds} from "../../helpers/time";
import flatten from "lodash/flatten";

export const TIME_SLIDER_MAX = 86400;
export const TIME_SLIDER_MIN = 0;

@inject(app("Time", "UI"))
@observer
class TimeSlider extends Component {
  getNumericValueFromTime = (time = "") => {
    return timeToSeconds(time);
  };

  onChange = (e) => {
    const {Time, state} = this.props;
    const {live} = state;

    const value = parseInt(get(e, "target.value", 0), 10);

    if (live) {
      Time.toggleLive(false);
    }

    Time.setSeconds(value);
  };

  getRange = (positions) => {
    if (positions.length !== 0) {
      const allPositions = flatten(positions.map(({events}) => events));
      const positionsTimeRange = getTimeRangeFromPositions(allPositions);

      if (positionsTimeRange) {
        return positionsTimeRange;
      }
    }

    return {min: TIME_SLIDER_MIN, max: TIME_SLIDER_MAX};
  };

  render() {
    const {className, state, positions} = this.props;
    const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = this.getRange(positions);

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
