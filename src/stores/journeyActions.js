import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";

const history = createHistory();

export function createJourneyPath(journey) {
  const date = moment(journey.journey_start_timestamp).tz("Europe/Helsinki");

  const dateStr = date.format("YYYY-MM-DD");
  const timeStr = date.format("HHmm");

  return `/journey/${dateStr}/${timeStr}/${journey.route_id}/${
    journey.direction_id
  }`;
}

export default (state) => {
  const setSelectedJourney = action((journey = null) => {
    console.trace();

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
