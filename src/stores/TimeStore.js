import {extendObservable} from "mobx";
import timeActions from "./timeActions";
import {combineDateAndTime, timeToFormat} from "../helpers/time";
import get from "lodash/get";
import moment from "moment-timezone";

export default (state, initialState) => {
  extendObservable(state, {
    time: get(
      initialState,
      "time",
      timeToFormat(new Date(), "HH:mm:ss", "Europe/Helsinki")
    ),
    get unixTime() {
      const {date, time} = state;
      return combineDateAndTime(date, time, "Europe/Helsinki").unix();
    },
    get timeIsCurrent() {
      const {date, time} = state;
      const selectedMoment = combineDateAndTime(date, time, "Europe/Helsinki");

      // If the selected time is within 10 minutes of the current time, it is considered current.
      const minTime = selectedMoment.clone().subtract(5, "minutes");
      const maxTime = selectedMoment.clone().add(5, "minutes");

      return moment.tz(new Date(), "Europe/Helsinki").isBetween(minTime, maxTime);
    },
    timeIncrement: 5,
    areaSearchRangeMinutes: 60,
  });

  const actions = timeActions(state);
  return actions;
};
