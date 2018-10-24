import {createFetchKey} from "../helpers/hfpCache";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import * as localforage from "localforage";
import {combineDateAndTime} from "./time";
import pFinally from "p-finally";
import idle from "./idle";
import pAll from "p-all";

const currentPromises = new Map();
const memoryCache = new Map();
let isPersistingCache = false;

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

// Loads localstorage cache into memory
export async function loadCache() {
  let cachedKeys = null;

  try {
    cachedKeys = await localforage.keys();
  } catch (err) {
    cachedKeys = null;
  }

  if (!cachedKeys || cachedKeys.length === 0) {
    return [];
  }

  let data = [];

  for (const cachedKey of cachedKeys) {
    const cachedJourney = await localforage.getItem(cachedKey);
    memoryCache.set(cachedKey, cachedJourney);
    data.push(cachedJourney);
  }

  return data;
}

// Persists the memory cache in localstorage
export async function persistCache() {
  if (!isPersistingCache && memoryCache.size !== 0) {
    isPersistingCache = true;
    await idle();

    const persistActions = [];
    const cacheEntries = memoryCache.entries();

    for (const [key, value] of cacheEntries) {
      persistActions.push(() => localforage.setItem(key, value));
    }

    await pAll(persistActions);

    isPersistingCache = false;
    console.log("Persisted memory cache.");
  }
}

async function getCachedJourney(fetchKey) {
  let cachedItem = memoryCache.get(fetchKey);

  if (!cachedItem) {
    cachedItem = await localforage.getItem(fetchKey);
  }

  return cachedItem;
}

export async function fetchHfpJourney(route, date, time) {
  // If fetchKey is false then we don't have all required data yet
  const fetchKey = createFetchKey(route, date, time);

  if (!fetchKey) {
    return [];
  }

  let fetchPromise = currentPromises.get(fetchKey);

  if (!fetchPromise) {
    try {
      // Start a new fetch promise if one isn't already in progress
      fetchPromise = getCachedJourney(fetchKey).then((cachedJourney) => {
        if (cachedJourney) {
          return cachedJourney;
        }

        return (
          queryHfp(route, date, time)
            .then((result) =>
              // TODO: Change this when we have to deal with null positions
              result.filter((pos) => !!pos && !!pos.lat && !!pos.long)
            )
            .then((filteredData) => filteredData.map(createHfpItem))
            .then((formattedData) =>
              // Group into journey groups
              groupHfpPositions(formattedData, getJourneyId, "journeyId")
            )
            // Cache the data.
            .then((journeyGroups) => {
              memoryCache.set(fetchKey, journeyGroups);
              return journeyGroups;
            })
        );
      });
    } catch (err) {
      console.warn(`Cache or fetch error for ${fetchKey}`, err);
      return [];
    }

    // Remove the promise when it is finished
    pFinally(fetchPromise, () => {
      currentPromises.delete(fetchKey);
    });

    // Without awaiting it, save the promise in the promiseCache.
    currentPromises.set(fetchKey, fetchPromise);
  }

  return fetchPromise;
}
