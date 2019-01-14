import {action, reaction} from "mobx";
import moment from "moment-timezone";
import set from "lodash/set";
import unset from "lodash/unset";
import timer from "../helpers/timer";

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

  const updateTime = action(() => {
    const nowMoment = moment.tz(new Date(), "Europe/Helsinki");

    state.time = nowMoment.format("HH:mm:ss");
    state.date = nowMoment.format("YYYY-MM-DD");
  });

  const update = (isAuto = false) => {
    updateTime();

    Object.values(updateListeners).forEach(({auto, cb}) => {
      // Check that the cb should run when auto-updating if this is an auto-update.
      if (typeof cb === "function" && (!isAuto || (isAuto && auto))) {
        cb();
      }
    });
  };

  reaction(
    () => state.pollingEnabled && !state.playing,
    (isPolling) => {
      if (isPolling && !updateTimerHandle) {
        // timer() is a setInterval alternative that uses requestAnimationFrame.
        // This makes it more performant and can "pause" when the tab is not focused.
        updateTimerHandle = timer(() => update(true), 1000);
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
