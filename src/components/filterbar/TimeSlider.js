import React, {useMemo, useCallback} from "react";
import {observer} from "mobx-react-lite";
import RangeInput from "../RangeInput";
import {getTimeRangeFromEvents} from "../../helpers/getTimeRangeFromEvents";
import get from "lodash/get";
import flow from "lodash/flow";
import flatten from "lodash/flatten";
import {timeToSeconds, secondsToTime} from "../../helpers/time";
import Tooltip from "../Tooltip";
import {inject} from "../../helpers/inject";
import styled from "styled-components";
import useDimensions from "../../hooks/useDimensions";

const SliderContainer = styled.div`
  display: flex;
  position: relative;
  align-items: center;
`;

const RangeDisplay = styled.div`
  font-family: monospace;
  font-size: 12px;
  background: white;
  padding: 3px 8px;
  border: 3px solid var(--blue);
  border-left: 0;
  border-top-right-radius: 13px;
  border-bottom-right-radius: 13px;
  height: 26px;
  user-select: none;
  pointer-events: none;
  display: flex;
  align-items: center;

  &:last-child {
    border-radius: 13px 0 0 13px;
    border-left: 3px solid var(--blue);
    border-right: 0;
  }
`;

const SliderInput = styled(RangeInput)``;

const CurrentValue = styled(RangeDisplay)`
  position: absolute;
  z-index: 5;
  left: 51px;
  background: var(--blue);
  color: white;
  border-radius: 13px;
`;

export const TIME_SLIDER_MAX = 102600; // 28:30:00
export const TIME_SLIDER_MIN = 0; // 00:00:00
const TIME_SLIDER_DEFAULT_MIN = 16200; // 04:30

const decorate = flow(
  observer,
  inject("Time", "UI")
);

const TimeSlider = decorate(({className, Time, state, journeys}) => {
  const numericTime = useMemo(() => timeToSeconds(state.time), [state.time]);
  const [ref, {width}] = useDimensions();

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

    return {min: TIME_SLIDER_DEFAULT_MIN, max: TIME_SLIDER_MAX};
  }, [journeys]);

  const {min = TIME_SLIDER_MIN, max = TIME_SLIDER_MAX} = timeRange;
  let rangeMin = min;
  let rangeMax = max;

  rangeMin = isNaN(rangeMin) ? TIME_SLIDER_MIN : rangeMin;
  rangeMax = isNaN(rangeMax) ? TIME_SLIDER_MAX : rangeMax;
  const currentValue = Math.max(numericTime, rangeMin);

  const valuePosition = useMemo(() => {
    let point = (currentValue - rangeMin) / (rangeMax - rangeMin);
    let position = Math.max(point, 0);
    let offset = point * 24;

    if (position > 1) {
      position = width - offset;
    } else {
      position = width * point - offset;
    }
    return position;
  }, [currentValue, rangeMin, rangeMax, width]);

  return (
    <SliderContainer className={className}>
      <RangeDisplay>{secondsToTime(rangeMin)}</RangeDisplay>
      <Tooltip helpText="Time slider">
        <SliderInput
          innerRef={ref}
          value={currentValue}
          min={rangeMin}
          max={rangeMax}
          onChange={onChange}
        />
      </Tooltip>
      <CurrentValue
        style={{
          transform: `translateX(${valuePosition}px)`,
        }}>
        {secondsToTime(currentValue)}
      </CurrentValue>
      <RangeDisplay>{secondsToTime(rangeMax)}</RangeDisplay>
    </SliderContainer>
  );
});

export default TimeSlider;
