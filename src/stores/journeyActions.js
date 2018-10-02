import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import doubleDigit from "../helpers/doubleDigit";
import pick from "lodash/pick";
import createHistory from "history/createBrowserHistory";

const history = createHistory();

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journey_start_time", "direction_id", "route_id");
}

export function createJourneyPath(journey) {
  const date = new Date(`${journey.oday}T${journey.journey_start_time}`);

  const dateStr = `${date.getFullYear()}${doubleDigit(
    date.getMonth() + 1
  )}${doubleDigit(date.getDate())}`;

  const timeStr = `${doubleDigit(date.getHours())}${doubleDigit(date.getMinutes())}`;

  return `/journey/${dateStr}/${timeStr}/${journey.route_id}/${journey.direction_id}`;
}

export default (state) => {
  const setSelectedJourney = action((journey = null) => {
    if (
      !journey ||
      (state.selectedJourney &&
        getJourneyId(state.selectedJourney) === getJourneyId(journey))
    ) {
      state.selectedJourney = null;
      history.push("/");
    } else {
      state.selectedJourney = pickJourneyProps(journey);
      history.push(createJourneyPath(journey));
    }
  });

  return {
    setSelectedJourney,
  };
};
