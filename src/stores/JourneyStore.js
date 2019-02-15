import {extendObservable, action, reaction, runInAction} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import FilterActions from "./filterActions";
import TimeActions from "./timeActions";
import moment from "moment-timezone";
import journeyActions from "./journeyActions";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import {getPathName, getUrlValue} from "./UrlManager";
import get from "lodash/get";
import {setResetListener} from "./FilterStore";
import {getTimeString} from "../helpers/time";
import {TIMEZONE} from "../constants";

export default (state) => {
  extendObservable(state, {
    selectedJourney: null,
  });

  const filterActions = FilterActions(state);
  const timeActions = TimeActions(state);
  const actions = journeyActions(state);

  const selectJourneyFromUrl = action((pathname) => {
    const [
      // The first two array elements are an empty string and the word "journey".
      // eslint-disable-next-line no-unused-vars
      _,
      basePath,
      oday,
      journey_start_time,
      route_id,
      direction_id,
      instance = 1,
    ] = pathname.split("/");

    if (basePath === "journey") {
      const date = moment.tz(oday, "YYYYMMDD", TIMEZONE);

      let dateStr = "";
      let timeStr = "";

      if (date.isValid()) {
        dateStr = date.format("YYYY-MM-DD");
        filterActions.setDate(dateStr);
      }

      if (journey_start_time) {
        // Split the time into hours/minutes/seconds and create a valid time string.
        timeStr = getTimeString(...journey_start_time.match(/.{1,2}/g));

        if (timeStr && !getUrlValue("time", null)) {
          timeActions.setTime(timeStr);
        }
      }

      if (route_id && direction_id) {
        filterActions.setRoute({routeId: route_id, direction: direction_id});
      }

      // Validate the data from the url
      if (dateStr && timeStr && route_id && direction_id) {
        // The pick is a bit redundant here, but I want to make sure
        // that everything assigned to selectedJourney always looks
        // the same. What the pick returns may change in the future.
        const journey = pickJourneyProps({
          oday: dateStr,
          route_id,
          direction_id,
          journey_start_time: timeStr,
          instance: instance ? parseInt(instance, 10) : 1,
        });

        if (getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
          state.selectedJourney = journey;
        }
      }
    }
  });

  selectJourneyFromUrl(getPathName());

  // If a journey is selected, sync the day of the selected journey when the
  // selected date changes.
  reaction(
    () => state.date,
    (currentDate) => {
      const currentlySelectedJourney = state.selectedJourney;

      // No action if there is not a selected journey
      if (!currentlySelectedJourney) {
        return;
      }

      const journeyDate = get(currentlySelectedJourney, "oday", "");

      if (journeyDate !== currentDate) {
        runInAction(() => {
          state.selectedJourney.oday = currentDate;
        });
      }
    }
  );

  setResetListener(() => actions.setSelectedJourney(null));

  return {
    ...actions,
  };
};
