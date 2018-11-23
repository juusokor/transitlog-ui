import {action} from "mobx";

const timeActions = (state) => {
  const setTime = action((timeValue) => (state.time = timeValue));

  const setTimeIncrement = action(
    (timeIncrementValue) => (state.timeIncrement = timeIncrementValue)
  );

  const setAreaSearchMinutes = action(
    (searchValue) => (state.areaSearchRangeMinutes = searchValue)
  );

  return {
    setTime,
    setTimeIncrement,
    setAreaSearchMinutes,
  };
};

export default timeActions;
