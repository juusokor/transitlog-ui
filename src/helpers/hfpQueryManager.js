import {getCachedData, cacheData, createFetchKey} from "../helpers/hfpCache";
import get from "lodash/get";
import set from "lodash/set";
import flatten from "lodash/flatten";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import compact from "lodash/compact";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import * as localforage from "localforage";
import {combineDateAndTime, getTimeRange} from "./time";
import pQueue from "p-queue";

let promiseCache = {};

const concurrentQueries = 3;

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

export async function getCachedJourneyIds(route, date, timeRange) {
  let cachedKeys = null;

  try {
    cachedKeys = await localforage.keys();
  } catch (err) {
    cachedKeys = null;
  }

  if (!cachedKeys || cachedKeys.length === 0) {
    return [];
  }

  const cachedJourneyIds = cachedKeys.filter((key) => {
    if (!key.startsWith("journey")) {
      return false;
    }

    const keyParts = key.slice(8).split("_");

    return (
      keyParts[0] === date &&
      keyParts[2] === route.routeId &&
      keyParts[3] === route.direction
    );
  });

  if (cachedJourneyIds.length === 0) {
    return [];
  }

  const {max, min} = timeRange;

  return cachedJourneyIds.reduce((matchingJourneys, cachedId) => {
    const idTime = cachedId.slice(8).split("_")[1];

    const cachedTimeMoment = combineDateAndTime(date, idTime, "Europe/Helsinki");

    if (cachedTimeMoment.isBetween(min, max)) {
      matchingJourneys.push(cachedId);
    }

    return matchingJourneys;
  }, []);
}

function getCachePromisesForDate(route, date) {
  const cacheSlice = get(promiseCache, createFetchKey(route, date, false, true), {});
  const promiseKeys = Object.keys(cacheSlice);

  if (promiseKeys.length === 0) {
    return [];
  }

  const pickedPromises = [];

  for (const promiseKey of promiseKeys) {
    pickedPromises.push(get(cacheSlice, promiseKey));
  }

  return compact(pickedPromises);
}

export async function fetchHfp(route, date, time) {
  const timeMoment = combineDateAndTime(date, time, "Europe/Helsinki");
  const timeRange = getTimeRange(timeMoment);
  const fetchKey = createFetchKey(route, date, timeRange.min.format("HH:mm:ss"));

  // If fetchKey is false then we don't have all required data yet
  if (!fetchKey) {
    return [];
  }

  let cachingPromise = get(promiseCache, fetchKey);

  if (!cachingPromise) {
    try {
      // Start a new fetch if one isn't already in progress
      cachingPromise = getCachedJourneyIds(route, date, timeRange).then(
        (cachedJourneyIds) => {
          if (cachedJourneyIds.length !== 0) {
            return getCachedData(cachedJourneyIds);
          }

          return (
            queuedQueryHfp(route, date, timeRange) // Format the data...
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

  // Await the caching promise we got, as well as all the other ones for this date.
  const cachePromisesForDate = getCachePromisesForDate(route, date);
  const allItemsForDate = await Promise.all(cachePromisesForDate);

  if (allItemsForDate.length === 0) {
    return [];
  }

  return orderBy(uniqBy(flatten(allItemsForDate), "journeyId"), ({journeyId}) => {
    const keyParts = journeyId.slice(8).split("_");
    return keyParts[1];
  });
}

const queryQueue = new pQueue({concurrency: concurrentQueries});

function queuedQueryHfp(route, date, timeRange) {
  const fetcher = () => queryHfp(route, date, timeRange);
  return queryQueue.add(fetcher);
}
