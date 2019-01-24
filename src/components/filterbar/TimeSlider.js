import React, {Component} from "react";
import moment from "moment-timezone";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import RangeInput from "../RangeInput";
import {
  dateToSeconds,
  getTimeRangeFromPositions,
} from "../../helpers/getTimeRangeFromPositions";
import getJourneyId from "../../helpers/getJourneyId";
import get from "lodash/get";

export const TIME_SLIDER_MAX = 86399;
export const TIME_SLIDER_MIN = 0;

@inject(app("Time", "UI"))
@observer
class TimeSlider extends Component {
  getNumericValue = (value = "", date) => {
    const {max} = this.getRange();

    const operationDay = moment
      .tz(date, "Europe/Helsinki")
      .hours(4)
      .minutes(30);

    const startVal = operationDay.clone();

    if (value) {
      const [hours = 4, minutes = 30, seconds = 0] = value.split(":");
      startVal.hours(hours);
      startVal.minutes(minutes);
      startVal.seconds(seconds);

      if (startVal.isBefore(operationDay)) {
        startVal.add(1, "days");
      }
    } else {
      startVal.add(max, "seconds");
    }

    return Math.abs(startVal.diff(operationDay, "seconds"));
  };

  getTimeValue = (value, date) => {
    const nextDate = moment
      .tz(date, "Europe/Helsinki")
      .hours(4)
      .minutes(30)
      .add(parseInt(value, 10), "seconds");

    return nextDate.format("HH:mm:ss");
  };

  onChange = (e) => {
    const {
      Time,
      state: {date, live},
    } = this.props;

    const timeValue = this.getTimeValue(e.target.value, date);

    if (live) {
      Time.toggleLive(false);
    }

    Time.setTime(timeValue);
  };

  getRange = () => {
    const {
      positions,
      timeRange,
      state: {selectedJourney, route},
    } = this.props;

    if ((!route || !route.routeId) && timeRange) {
      const operationDay = timeRange.min
        .clone()
        .hours(4)
        .minutes(30)
        .seconds(0);

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

      return getTimeRangeFromPositions(
        selectedJourneyPositions,
        TIME_SLIDER_MIN,
        TIME_SLIDER_MAX
      );
    }

    return {min: TIME_SLIDER_MIN, max: TIME_SLIDER_MAX};
  };

  render() {
    const {
      className,
      state: {date, time},
    } = this.props;

    const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = this.getRange();

    return (
      <div className={className}>
        <RangeInput
          value={this.getNumericValue(time, date)}
          min={min}
          max={max}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TimeSlider;
