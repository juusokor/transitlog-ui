import React, {useMemo, useCallback} from "react";
import {observer} from "mobx-react-lite";
import RangeInput from "../RangeInput";
import {getTimeRangeFromEvents} from "../../helpers/getTimeRangeFromEvents";
import get from "lodash/get";
import flow from "lodash/flow";
import flatten from "lodash/flatten";
import {timeToSeconds} from "../../helpers/time";
import Tooltip from "../Tooltip";
import {inject} from "../../helpers/inject";

export const TIME_SLIDER_MAX = 86400;
export const TIME_SLIDER_MIN = 0;

const decorate = flow(
  observer,
  inject("Time", "UI")
);

const TimeSlider = decorate(({className, Time, state, journeys}) => {
  const numericTime = useMemo(() => timeToSeconds(state.time), [state.time]);

  const onChange = useCallback(
    (e) => {
      const {live} = state;
      const value = parseInt(get(e, "target.value", 0), 10);

      if (live) {
        Time.toggleLive(false);
      }

      Time.setSeconds(value);
    },
    [state.live, Time]
  );

  const timeRange = useMemo(() => {
    if (journeys.length !== 0) {
      // Get the first and last event from each journey. This is used
      // to get the min and max time for the range slider.
      const eventsRange = flatten(
        journeys.map(({events = []}) => [events[0], events[events.length - 1]])
      );

      const eventsTimeRange = getTimeRangeFromEvents(eventsRange);

      if (eventsTimeRange) {
        return eventsTimeRange;
      }
    }

    return {min: TIME_SLIDER_MIN, max: TIME_SLIDER_MAX};
  }, [journeys]);

  const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = timeRange;
  const rangeMin = Math.min(numericTime, min);
  const rangeMax = Math.max(numericTime, max);

  return (
    <div className={className}>
      <Tooltip helpText="Time slider">
        <RangeInput
          value={Math.min(Math.max(numericTime, rangeMin), rangeMax)}
          min={isNaN(rangeMin) ? TIME_SLIDER_MIN : rangeMin}
          max={isNaN(rangeMax) ? TIME_SLIDER_MAX : rangeMax}
          onChange={onChange}
        />
      </Tooltip>
    </div>
  );
});

export default TimeSlider;
