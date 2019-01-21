import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import debounce from "lodash/debounce";

const timeActions = (state) => {
  // Time might update frequently, so make sure that setting it
  // in the url doesn't slow down the app.
  const setUrlTime = debounce((time) => setUrlValue("time", time), 1000);

  const setTime = action((timeValue, setUrlImmediately = false) => {
    state.time = timeValue;

    if (!setUrlImmediately) {
      setUrlTime(state.time);
    } else {
      setUrlValue("time", state.time);
    }
  });

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
    setTimeIncrement,
    setAreaSearchMinutes,
    toggleLive,
  };
};

export default timeActions;
