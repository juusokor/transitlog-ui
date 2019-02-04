import {extendObservable} from "mobx";
import timeActions from "./timeActions";
import {getMomentFromDateTime, timeToSeconds} from "../helpers/time";
import get from "lodash/get";
import moment from "moment-timezone";
import {getUrlValue} from "./UrlManager";
import {setResetListener} from "./FilterStore";

export default (state, initialState) => {
  extendObservable(state, {
    live: getUrlValue("live", false),
    time: get(
      initialState,
      "time",
      moment.tz(new Date(), "Europe/Helsinki").format("HH:mm:ss")
    ),
    get unixTime() {
      const {date, time} = state;
      const unixTime = moment.tz(date, "Europe/Helsinki").unix();
      return unixTime + timeToSeconds(time);
    },
    get timeIsCurrent() {
      const {date, time} = state;
      const selectedMoment = getMomentFromDateTime(date, time, "Europe/Helsinki");

      // If the selected time is within 10 minutes of the current time, it is considered current.
      const minTime = selectedMoment.clone().subtract(5, "minutes");
      const maxTime = selectedMoment.clone().add(5, "minutes");

      return moment.tz(new Date(), "Europe/Helsinki").isBetween(minTime, maxTime);
    },
    timeIncrement: 5,
    areaSearchRangeMinutes: 60,
  });

  const actions = timeActions(state);

  setResetListener(() => actions.toggleLive(false));

  return actions;
};
