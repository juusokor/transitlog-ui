import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";
import {combineDateAndTime} from "../helpers/time";

const history = createHistory();

export function createJourneyPath(journey) {
  let startTimestamp = journey.journey_start_timestamp;

  if (!startTimestamp) {
    startTimestamp = combineDateAndTime(
      journey.oday,
      journey.journey_start_time,
      "Europe/Helsinki"
    );
  }

  const date = moment(startTimestamp).tz("Europe/Helsinki");

  const dateStr = date.format("YYYYMMDD");
  const timeStr = date.format("HHmm");

  return `/journey/${dateStr}/${timeStr}/${journey.route_id}/${
    journey.direction_id
  }`;
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
