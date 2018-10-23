import {getCachedData, cacheData, createFetchKey} from "../helpers/hfpCache";
import get from "lodash/get";
import set from "lodash/set";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import * as localforage from "localforage";
import {combineDateAndTime} from "./time";
import pQueue from "p-queue";

const promiseCache = {};
const concurrentQueries = 10;

// Add props to or modify the HFP item.
function createHfpItem(rawHfp) {
  const journeyStartMoment = combineDateAndTime(
    rawHfp.oday,
    rawHfp.journey_start_time,
    "Europe/Helsinki"
  );

  return {
    ...rawHfp,
    journey_start_timestamp: journeyStartMoment.toISOString(),
  };
}

// Find already-cached journeys
export async function getCachedJourneyIds(route, date, time) {
  let cachedKeys = null;

  try {
    cachedKeys = await localforage.keys();
  } catch (err) {
    cachedKeys = null;
  }

  if (!cachedKeys || cachedKeys.length === 0) {
    return [];
  }

  return cachedKeys.filter((key) => {
    if (!key.startsWith("journey")) {
      return false;
    }

    const keyParts = key.slice(8).split("_");

    return (
      keyParts[0] === date &&
      keyParts[1] === time &&
      keyParts[2] === route.routeId &&
      keyParts[3] === route.direction
    );
  });
}

export async function fetchHfpJourney(route, date, time) {
  // If fetchKey is false then we don't have all required data yet
  const fetchKey = createFetchKey(route, date, time);

  if (!fetchKey) {
    return [];
  }

  let cachingPromise = get(promiseCache, fetchKey);

  if (!cachingPromise) {
    try {
      // Start a new fetchKey if one isn't already in progress
      cachingPromise = getCachedJourneyIds(route, date, time).then(
        (cachedJourneyIds) => {
          if (cachedJourneyIds.length !== 0) {
            return getCachedData(cachedJourneyIds);
          }

          return (
            queuedQueryHfp(route, date, time) // Format the data...
              .then((result) =>
                result.filter((pos) => !!pos && !!pos.lat && !!pos.long)
              )
              .then((filteredData) => filteredData.map(createHfpItem))
              // ...group the data by journey
              .then((formattedData) =>
                groupHfpPositions(formattedData, getJourneyId, "journeyId")
              )
              // ...and cache the data.
              .then((journeyGroups) => cacheData(journeyGroups, route, date))
          );
        }
      );
      // Without awaiting it, save the promise in the promiseCache.
      set(promiseCache, fetchKey, cachingPromise);
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  return cachingPromise;
}

const queryQueue = new pQueue({concurrency: concurrentQueries});

function queuedQueryHfp(route, date, time) {
  const fetcher = () => queryHfp(route, date, time);
  return queryQueue.add(fetcher);
}
