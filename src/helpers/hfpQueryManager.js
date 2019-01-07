import {createFetchKey} from "./keys";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import {createHfpItem} from "./createHfpItem";

export async function fetchHfpJourney(route, date, time) {
  // If fetchKey is false then we don't have all required data yet
  const fetchKey = createFetchKey(route, date, time);

  if (!fetchKey) {
    return false;
  }

  return queryHfp(route, date, time).then(({data, fetchedJourneyId}) => {
    const groupedData = groupHfpPositions(
      data
        // TODO: Change this when we have to deal with null positions
        .filter((pos) => !!pos && !!pos.lat && !!pos.long)
        .map(createHfpItem),
      getJourneyId,
      "journeyId"
      // Make sure all returned journeys were requested
    ).filter((jg) => jg.journeyId === fetchedJourneyId);
    return groupedData;
  });
}
