import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import {getCachedData, cacheData, getCacheKey} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import set from "lodash/set";
import {fetchHfpQuery} from "../queries/HfpQuery";
import takeEveryNth from "../helpers/takeEveryNth";
import withRoute from "./withRoute";
import getJourneyId from "../helpers/getJourneyId";
import {fromPromise} from "mobx-utils";

const formatData = (hfpData) => {
  if (hfpData.length === 0) {
    return hfpData;
  }

  return (
    takeEveryNth(hfpData, 2) // Take every other hfp item.
      // Some HFP items are null for one reason or another. Filter those out.
      .filter((pos) => !!pos && !!pos.lat && !!pos.long)
  );
};

const getGrouped = (hfpData, groupKey, groupNameKey) => {
  if (!hfpData || hfpData.length === 0) {
    return [];
  }

  const groupedData = groupBy(hfpData, groupKey);
  const vehicleGroups = map(groupedData, (positions, groupName) => ({
    [groupNameKey]: groupName,
    positions,
  }));

  return vehicleGroups;
};

const groupCache = {};
let cachingInProgress = {};

// Returns a mobxified promise that resolves to
// either cached hfp data or fetched hfp data.
const getCachePromise = (route, date) => {
  const cacheKey = getCacheKey(route, date);

  // The promise that will be mobxified
  const getData = async () => {
    // If cachekey is false then we don't have a route selection yet
    if (!cacheKey) {
      return {positions: [], cacheKey};
    }

    // If we have cached data for this cache key, that's it, we're done.
    const cachedData = await getCachedData(cacheKey);

    if (cachedData && cachedData.length !== 0) {
      return {positions: cachedData, cacheKey};
    }

    // All fetching and caching promises are recorded in the cachingInProgress object.
    // Look for a fetch-in-progress by the cache key.
    let cachingPromise = get(cachingInProgress, cacheKey, null);

    if (!cachingPromise) {
      // Start a new fetch if one isn't already in progress
      cachingPromise = fetchHfpQuery({route, date})
        // Format the data...
        .then((result) => formatData(result))
        // Cache the data...
        .then((formattedData) => cacheData(formattedData, route, date));

      // Without awaiting it, set the pending promise in the cachingInProgress object
      // so that other instances of this component can await it.
      set(cachingInProgress, cacheKey, cachingPromise);
    }

    // Await the caching promise we got
    const cachedResult = await cachingPromise;
    // When done, clear the promise so that future fetches may take place.
    set(cachingInProgress, cacheKey, null);

    return {positions: cachedResult, cacheKey};
  };

  // Mobxify the promise. This will give it an observable .value property and
  // the case() method that we use in the render function below.
  return fromPromise(getData());
};

const emptyCachePromise = () =>
  fromPromise.resolve({
    positions: [],
    cacheKey: false,
  });

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    currentCacheKey = false;
    cachePromise = emptyCachePromise();

    updateCachePromise() {
      const {
        route,
        state: {date},
      } = this.props;

      const cacheKey = getCacheKey(route, date);
      let setPromise = emptyCachePromise();

      // If we have a valid cacheKey (ie there is a route selected), and the key is
      // currently not in use, update the cache promise to fetch the current route.
      if (cacheKey && cacheKey !== this.currentCacheKey) {
        setPromise = getCachePromise(route, date);
      }

      // Always update the promise if the current cache key doesn't match the new one.
      // This allows for empty cache promises to be set, even if the above if doesn't run.
      if (cacheKey !== this.currentCacheKey) {
        this.currentCacheKey = cacheKey;
        this.cachePromise = setPromise;
      }
    }

    getGroupedByVehicle = (positions, cacheKey) =>
      this.groupCache("vehicles", cacheKey, () =>
        getGrouped(positions, "uniqueVehicleId", "vehicleId")
      );

    getGroupedByJourney = (positions, cacheKey) =>
      this.groupCache("journeys", cacheKey, () =>
        getGrouped(positions, getJourneyId, "journeyId")
      );

    // This cache is separate from the hfp stuff above. It caches the computed
    // hfp data groupings, by journey or by vehicle.
    groupCache = (cacheKey, hfpCacheKey, cacheFunc) => {
      if (!hfpCacheKey) {
        return [];
      }

      const cachedGroup = get(groupCache, `${hfpCacheKey}.${cacheKey}`, []);

      if (!cachedGroup || cachedGroup.length === 0) {
        const dataToCache = cacheFunc();

        if (dataToCache && dataToCache.length !== 0) {
          set(groupCache, `${hfpCacheKey}.${cacheKey}`, dataToCache);
        }

        return dataToCache;
      }

      return cachedGroup;
    };

    getComponent = (positions, cacheKey, loading) => (
      <Component
        {...this.props}
        loading={loading}
        positionsByVehicle={this.getGroupedByVehicle(positions, cacheKey)}
        positionsByJourney={this.getGroupedByJourney(positions, cacheKey)}
      />
    );

    render() {
      this.updateCachePromise();

      // Use the mobxified promise
      return this.cachePromise.case({
        pending: () => this.getComponent([], false, true),
        rejected: (error) => {
          console.error(error);
          return this.getComponent([], false, false);
        },
        fulfilled: ({positions, cacheKey}) =>
          this.getComponent(positions, cacheKey, false),
      });
    }
  }

  return WithHfpData;
};
