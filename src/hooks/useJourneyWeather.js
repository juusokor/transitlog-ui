import moment from "moment-timezone";
import {floorMoment} from "../helpers/roundMoment";
import {TIMEZONE} from "../constants";
import {useWeather} from "./useWeather";
import {latLng} from "leaflet";
import {useMemo} from "react";
import {useDebouncedValue} from "./useDebouncedValue";
import getJourneyId from "../helpers/getJourneyId";

export const useJourneyWeather = (journeyPositions, selectedJourney = "") => {
  let journeyPosition = !journeyPositions
    ? null
    : journeyPositions.get(getJourneyId(selectedJourney));

  journeyPosition = useDebouncedValue(journeyPosition, 1000);

  const dateTime = useMemo(
    () =>
      journeyPosition
        ? floorMoment(moment.tz(journeyPosition.tst, TIMEZONE), 10, "minutes")
        : null,
    [journeyPosition]
  );

  const pos = useMemo(
    () =>
      journeyPosition
        ? latLng({
            lat: journeyPosition.lat,
            lng: journeyPosition.long,
          })
        : null,
    [journeyPosition]
  );

  return useWeather(pos, dateTime);
};
