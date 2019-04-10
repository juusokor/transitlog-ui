import {extendObservable} from "mobx";
import timeActions from "./timeActions";
import {getMomentFromDateTime} from "../helpers/time";
import get from "lodash/get";
import moment from "moment-timezone";
import {getUrlValue} from "./UrlManager";
import {setResetListener} from "./FilterStore";
import {TIMEZONE} from "../constants";

export default (state, initialState) => {
  extendObservable(state, {
    live: getUrlValue("live", false),
    time: get(initialState, "time", moment.tz(new Date(), TIMEZONE).format("HH:mm:ss")),
    get unixTime() {
      const {date, time} = state;
      return getMomentFromDateTime(date, time).unix();
    },
    get timeIsCurrent() {
      const {date, time} = state;
      const selectedMoment = getMomentFromDateTime(date, time, TIMEZONE);

      // If the selected time is within 10 minutes of the current time, it is considered current.
      const minTime = selectedMoment.subtract(5, "minutes");
      const maxTime = selectedMoment.add(5, "minutes");
      return moment().isBetween(minTime, maxTime, "second", "[]");
    },
    get isLiveAndCurrent() {
      const {live, timeIsCurrent} = state;
      return live && timeIsCurrent;
    },
    timeIncrement: parseInt(get(initialState, "time_increment", "5"), 10),
    areaSearchRangeMinutes: parseInt(get(initialState, "area_search_minutes", 60), 10),
  });

  const actions = timeActions(state);

  setResetListener(() => actions.toggleLive(false));

  return actions;
};
