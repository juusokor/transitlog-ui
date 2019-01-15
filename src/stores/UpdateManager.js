import {action, reaction} from "mobx";
import moment from "moment-timezone";
import set from "lodash/set";
import get from "lodash/get";
import unset from "lodash/unset";
import timer from "../helpers/timer";
import TimeActions from "./timeActions";
import FilterActions from "./filterActions";
import {combineDateAndTime} from "../helpers/time";
import UiActions from "./uiActions";

const updateListeners = {};

// Add update callbacks by name to enable overwriting the callback with
// a new instance without needing to remove the previous one.
// Pass false as the third arg to prevent this from running when auto-updating.
export function setUpdateListener(name, cb, auto = true) {
  set(updateListeners, name, {auto, cb});
  return removeUpdateListener;
}

export function removeUpdateListener(name) {
  return unset(updateListeners, name);
}

export default (state) => {
  let updateTimerHandle = null;
  const timeActions = TimeActions(state);
  const filterActions = FilterActions(state);
  const uiActions = UiActions(state);

  const updateTime = action((setCurrent = true) => {
    const {time, timeIncrement, date} = state;
    const selectedMoment = combineDateAndTime(date, time, "Europe/Helsinki");
    const nowMoment = moment.tz(new Date(), "Europe/Helsinki");

    if (!setCurrent) {
      const nextTimeValue = selectedMoment
        .clone()
        .add(timeIncrement, "seconds")
        .format("HH:mm:ss");

      timeActions.setTime(nextTimeValue);
    } else {
      timeActions.setTime(nowMoment.format("HH:mm:ss"));
      filterActions.setDate(nowMoment.format("YYYY-MM-DD"));
    }
  });

  const update = (isAuto = false, setCurrentTime = !isAuto) => {
    if (!isAuto) {
      uiActions.togglePolling(false);
    }

    updateTime(setCurrentTime);

    Object.values(updateListeners).forEach(({auto, cb}) => {
      // Check that the cb should run when auto-updating if this is an auto-update.
      if (typeof cb === "function" && (!isAuto || (isAuto && auto))) {
        cb();
      }
    });
  };

  reaction(
    () => state.pollingEnabled,
    (isPolling) => {
      const {timeIsCurrent, date} = state;

      if (isPolling && !updateTimerHandle) {
        // timer() is a setInterval alternative that uses requestAnimationFrame.
        // This makes it more performant and can "pause" when the tab is not focused.
        updateTimerHandle = timer(() => update(true, timeIsCurrent), 1000);
        updateTimerHandle.date = date;
      } else if (!isPolling && !!updateTimerHandle) {
        cancelAnimationFrame(updateTimerHandle.value);
        updateTimerHandle = null;
      }
    },
    {fireImmediately: true}
  );

  return {
    update,
  };
};
