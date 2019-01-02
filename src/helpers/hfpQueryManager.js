import {createFetchKey} from "./keys";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import {extendPrototypeResult as indexedLocalforage} from "localforage-indexes";
import lruDriver from "localforage-lru-driver";
import {combineDateAndTime} from "./time";
import pAll from "p-all";
import moment from "moment-timezone";
import {createHfpItem} from "./createHfpItem";

// Bump db version if you change something concerning the local cache.
// That will make all client's databases clear out.
const INDEX_KEY = "lruIndex";

const memoryCache = new Map();
let isPersistingCache = false;

const localforage = indexedLocalforage.defineDriver(lruDriver).then(async () => {
  const lf = indexedLocalforage.createInstance({
    driver: "lruStorage",
    cacheSize: 50,
    lruIndex: INDEX_KEY,
  });

  await lf.ready();

  return lf;
});

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
}

// Persists the memory cache in localstorage
export async function persistCache() {
  if (!isPersistingCache && memoryCache.size !== 0) {
    const storage = await localforage;

    if (!storage) {
      return;
    }

    isPersistingCache = true;

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

const doFetch = (fetchRoute, fetchDate, fetchTime, fetchKey) =>
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

export async function fetchHfpJourney(route, date, time, skipCache) {
  // If fetchKey is false then we don't have all required data yet
  const fetchKey = createFetchKey(route, date, time);

  if (!fetchKey) {
    return false;
  }

  let fetchPromise = [];

  try {
    if (skipCache) {
      fetchPromise = doFetch(route, date, time, fetchKey);
    } else {
      // Start a new fetch promise if one isn't already in progress
      fetchPromise = getCachedJourney(fetchKey).then(async (cachedJourney) => {
        if (cachedJourney) {
          return cachedJourney;
        }

        return doFetch(route, date, time, fetchKey);
      });
    }
  } catch (err) {
    console.warn(`Cache or fetch error for ${fetchKey}`, err);
    return [];
  }

  return fetchPromise;
}
