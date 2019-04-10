import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import debounce from "lodash/debounce";
import doubleDigit from "../helpers/doubleDigit";
import {secondsToTimeObject} from "../helpers/time";
import {intval} from "../helpers/isWithinRange";

const timeActions = (state) => {
  // Time might update frequently, so make sure that setting it
  // in the url doesn't slow down the app.
  const setUrlTime = debounce((time) => setUrlValue("time", time), 1000);

  const setTime = action((timeValue) => {
    state.time = timeValue;
    setUrlTime(state.time);
  });

  const setSeconds = (setValue = 0) => {
    const {hours, minutes, seconds} = secondsToTimeObject(setValue);
    setTime(`${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`);
  };

  const setTimeIncrement = action((timeIncrementValue = 0) => {
    state.timeIncrement = Math.max(Math.min(intval(timeIncrementValue || 0), 60 * 60), 1);
    setUrlValue("time_increment", state.timeIncrement);
  });

  const setAreaSearchMinutes = action((searchValue = 0) => {
    state.areaSearchRangeMinutes = Math.max(
      Math.min(intval(searchValue || 0), 60 * 12),
      5
    );
    setUrlValue("area_search_minutes", state.areaSearchRangeMinutes);
  });

  const toggleLive = action((setTo = !state.live) => {
    state.live = setTo;
    setUrlValue("live", state.live);
  });

  return {
    setTime,
    setSeconds,
    setTimeIncrement,
    setAreaSearchMinutes,
    toggleLive,
  };
};

export default timeActions;
