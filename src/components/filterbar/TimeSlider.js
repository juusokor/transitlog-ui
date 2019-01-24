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
  disposeTimeReaction = () => {};

  @observable
  timeValue = TIME_SLIDER_MIN;

  @computed get rangeOrigin() {
    const {date} = this.props.state;
    return moment
      .tz(date, "Europe/Helsinki")
      .hours(4)
      .minutes(30);
  }

  setTimeValue = action((timeValue = 0) => {
    this.timeValue = timeValue;
  });

  getNumericValueFromTime = (time = "", date) => {
    const {max} = this.getRange();
    const val = this.rangeOrigin;

    const nextVal = val.clone();

    if (time) {
      const [hours = 4, minutes = 30, seconds = 0] = time.split(":");
      nextVal.hours(hours);
      nextVal.minutes(minutes);
      nextVal.seconds(seconds);

      if (nextVal.isBefore(val)) {
        nextVal.add(1, "days");
      }
    } else {
      nextVal.add(get(max, "max", TIME_SLIDER_MAX), "seconds");
    }

    return Math.abs(val.diff(nextVal, "seconds"));
  };

  getRelativeValue = (unixTime, date) => {
    const operationDay = moment
      .tz(date, "Europe/Helsinki")
      .hours(4)
      .minutes(30)
      .unix();

    return unixTime - operationDay;
  };

  onChange = action((e) => {
    const {Time, state} = this.props;
    const {live} = state;

    const value = parseInt(get(e, "target.value", 0), 10);

    if (live) {
      Time.toggleLive(false);
    }

    this.setTimeValue(value);
  });

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

      return getTimeRangeFromPositions(selectedJourneyPositions);
    }

    return {min: TIME_SLIDER_MIN, max: TIME_SLIDER_MAX};
  };

  componentDidMount() {
    const {state} = this.props;

    this.disposeTimeReaction = reaction(
      () => state.time,
      (time) => {
        const {timeRange, positions = []} = this.props;

        if (!timeRange && positions.length === 0) {
          const timeValue = this.getNumericValueFromTime(time);
          this.setTimeValue(timeValue);
        }
      }
    );
  }

  render() {
    const {className} = this.props;
    const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = this.getRange();

    return (
      <div className={className}>
        <RangeInput
          value={this.timeValue}
          min={min}
          max={max}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TimeSlider;
