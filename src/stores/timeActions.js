import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import debounce from "lodash/debounce";
import doubleDigit from "../helpers/doubleDigit";

const timeActions = (state) => {
  // Time might update frequently, so make sure that setting it
  // in the url doesn't slow down the app.
  const setUrlTime = debounce((time) => setUrlValue("time", time), 1000);

  const setTime = action((timeValue) => {
    state.time = timeValue;
    setUrlTime(state.time);
  });

  const setSeconds = (setValue = 0) => {
    const hours = Math.floor(setValue / 3600);
    const minutes = Math.floor((setValue % 3600) / 60);
    const seconds = Math.floor((setValue % 3600) % 60);

    setTime(`${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`);
  };

  const setTimeIncrement = action(
    (timeIncrementValue) => (state.timeIncrement = timeIncrementValue)
  );

  const setAreaSearchMinutes = action(
    (searchValue) => (state.areaSearchRangeMinutes = searchValue)
  );

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
