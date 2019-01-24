import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import debounce from "lodash/debounce";
import moment from "moment-timezone";

const timeActions = (state) => {
  // Time might update frequently, so make sure that setting it
  // in the url doesn't slow down the app.
  const setUrlTime = debounce((time) => setUrlValue("time", time), 1000);

  const setTime = action((timeValue) => {
    state.time = timeValue;
    setUrlTime(state.time);
  });

  const setUnixTime = action((addValue = 0) => {
    const {unixTime} = state;

    state.time = moment
      .unix(unixTime + addValue)
      .tz("Europe/Helsinki")
      .format("HH:mm:ss");

    setUrlTime(state.time);
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
