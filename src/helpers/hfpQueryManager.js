import {createFetchKey} from "./keys";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import {extendPrototypeResult as indexedLocalforage} from "localforage-indexes";
import lruDriver from "localforage-lru-driver";
import {combineDateAndTime} from "./time";
import pFinally from "p-finally";
import idle from "./idle";
import pAll from "p-all";
import moment from "moment-timezone";

// Bump db version if you change something concering the local cache.
// That will make all client's databases clear out.
const DATABASE_VERSION = "1";
const INDEX_KEY = "lruIndex";

const currentPromises = new Map();
const memoryCache = new Map();
let isPersistingCache = false;

const localforage = indexedLocalforage.defineDriver(lruDriver).then(async () => {
  const lf = indexedLocalforage.createInstance({
    driver: "lruStorage",
    cacheSize: 50,
    lruIndex: INDEX_KEY,
  });

  await lf.ready();

  const dbVersion = localStorage.getItem("DATABASE_VERSION");

  if (dbVersion !== DATABASE_VERSION) {
    console.log("Clearing cache");
    lf.clear();
    localStorage.setItem("DATABASE_VERSION", DATABASE_VERSION);
  }

  return lf;
});

// Add props to or modify the HFP item.
function createHfpItem(rawHfp) {
  const journeyStartMoment = combineDateAndTime(
    rawHfp.oday,
    rawHfp.journey_start_time,
    "Europe/Helsinki"
  );

  return {
    ...rawHfp,
    received_at_unix: moment.tz(rawHfp.received_at, "Europe/Helsinki").unix(),
    journey_start_timestamp: journeyStartMoment.toISOString(),
  };
}

// Loads localstorage cache into memory
export async function loadCache() {
  let cachedKeys = null;
  const storage = await localforage;

  if (!storage) {
    return [];
  }

  try {
    cachedKeys = await storage.keys();
  } catch (err) {
    cachedKeys = null;
  }

  if (!cachedKeys || cachedKeys.length === 0) {
    return [];
  }

  let data = [];

  for (const cachedKey of cachedKeys) {
    const cachedJourney = await storage.getItem(cachedKey);
    memoryCache.set(cachedKey, cachedJourney);
    data.push(cachedJourney);
  }

  return data;
}

// Persists the memory cache in localstorage
export async function persistCache() {
  if (!isPersistingCache && memoryCache.size !== 0) {
    const storage = await localforage;

    if (!storage) {
      return;
    }

    isPersistingCache = true;
    await idle();

    const persistActions = [];
    const cacheEntries = memoryCache.entries();

    for (const [key, value] of cacheEntries) {
      persistActions.push(() => storage.setItem(key, value));
    }

    await pAll(persistActions);
    isPersistingCache = false;
  }
}

async function getCachedJourney(fetchKey) {
  let cachedItem = memoryCache.get(fetchKey);

  if (!cachedItem) {
    const storage = await localforage;
    cachedItem = await storage.getItem(fetchKey);
  }

  return cachedItem;
}

export async function fetchHfpJourney(route, date, time, skipCache) {
  // If fetchKey is false then we don't have all required data yet
  const fetchKey = createFetchKey(route, date, time);

  if (!fetchKey) {
    return [];
  }

  let fetchPromise = currentPromises.get(fetchKey);

  if (!fetchPromise) {
    const doFetch = (fetchRoute, fetchDate, fetchTime) =>
      queryHfp(fetchRoute, fetchDate, fetchTime).then(({data, fetchedJourneyId}) => {
        const groupedData = groupHfpPositions(
          data
            // TODO: Change this when we have to deal with null positions
            .filter((pos) => !!pos && !!pos.lat && !!pos.long)
            .map(createHfpItem),
          getJourneyId,
          "journeyId"
          // Make sure all returned journeys were requested
        ).filter((jg) => jg.journeyId === fetchedJourneyId);

        memoryCache.set(fetchKey, groupedData);
        return groupedData;
      });

    try {
      if (skipCache) {
        fetchPromise = doFetch(route, date, time);
      } else {
        // Start a new fetch promise if one isn't already in progress
        fetchPromise = getCachedJourney(fetchKey).then(async (cachedJourney) => {
          if (cachedJourney) {
            return cachedJourney;
          }

          return doFetch(route, date, time);
        });
      }
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
