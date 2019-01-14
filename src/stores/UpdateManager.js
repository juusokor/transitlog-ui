import {action} from "mobx";
import moment from "moment-timezone";
import set from "lodash/set";
import unset from "lodash/unset";

const updateListeners = {};

// Add update callbacks by name to enable overwriting the callback with
// a new instance without needing to remove the previous one.
export function setUpdateListener(name, cb) {
  set(updateListeners, name, cb);
  return removeUpdateListener;
}

export function removeUpdateListener(name) {
  return unset(updateListeners, name);
}

export default (state) => {
  const update = action(() => {
    console.log("Update");
    const nowMoment = moment.tz(new Date(), "Europe/Helsinki");

    state.time = nowMoment.format("HH:mm:ss");
    state.date = nowMoment.format("YYYY-MM-DD");

    Object.values(updateListeners).forEach((cb) => {
      if (typeof cb === "function") {
        cb();
      }
    });
  });

  return {
    update,
  };
};
