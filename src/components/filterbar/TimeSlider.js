import React, {useMemo, useCallback} from "react";
import {observer} from "mobx-react-lite";
import RangeInput from "../RangeInput";
import {getTimeRangeFromEvents} from "../../helpers/getTimeRangeFromEvents";
import get from "lodash/get";
import flow from "lodash/flow";
import {timeToSeconds} from "../../helpers/time";
import flatten from "lodash/flatten";
import Tooltip from "../Tooltip";
import {inject} from "../../helpers/inject";

export const TIME_SLIDER_MAX = 86400;
export const TIME_SLIDER_MIN = 0;

const decorate = flow(
  observer,
  inject("Time", "UI")
);

const TimeSlider = decorate(({className, Time, state, events}) => {
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
    if (events.length !== 0) {
      const allEvents = flatten(events.map(({events}) => events));
      const eventsTimeRange = getTimeRangeFromEvents(allEvents);

      if (eventsTimeRange) {
        return eventsTimeRange;
      }
    }

    return {min: TIME_SLIDER_MIN, max: TIME_SLIDER_MAX};
  }, [events]);

  const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = timeRange;

  return (
    <div className={className}>
      <Tooltip helpText="Time slider">
        <RangeInput
          value={numericTime}
          min={Math.min(numericTime, min)}
          max={Math.max(numericTime, max)}
          onChange={onChange}
        />
      </Tooltip>
    </div>
  );
});

export default TimeSlider;
