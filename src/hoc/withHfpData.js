import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import {getCachedData, cacheData, getCacheKey} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import set from "lodash/set";
import {fetchHfpQuery} from "../queries/HfpQuery";
import withRoute from "./withRoute";
import getJourneyId from "../helpers/getJourneyId";
import {fromPromise} from "mobx-utils";
import {groupHfpPositions} from "../helpers/groupHfpPositions";

const formatData = (hfpData) => {
  if (hfpData.length === 0) {
    return hfpData;
  }

  // Some HFP items are null for one reason or another. Filter those out.
  return hfpData.filter((pos) => !!pos && !!pos.lat && !!pos.long);
};

let cachingInProgress = {};

// Returns a mobxified promise that resolves to
// either cached hfp data or fetched hfp data.
const getCachePromise = (route, date) => {
  const cacheKey = getCacheKey(route, date);

  // The promise that will be mobxified
  const getData = async () => {
    // If cachekey is false then we don't have a route selection yet
    if (!cacheKey) {
      return [];
    }

    // If we have cached data for this cache key, that's it, we're done.
    const cachedData = await getCachedData(cacheKey);
    if (cachedData && cachedData.length !== 0) {
      return cachedData;
    }

    // All fetching and caching promises are recorded in the cachingInProgress object.
    // Look for a fetch-in-progress by the cache key.
    let cachingPromise = get(cachingInProgress, cacheKey, null);

    if (!cachingPromise) {
      // Start a new fetch if one isn't already in progress
      cachingPromise = fetchHfpQuery({route, date})
        // Format the data...
        .then((result) => formatData(result))
        // ...group the data by journey
        .then((formattedData) =>
          groupHfpPositions(formattedData, getJourneyId, "journeyId")
        )
        // ...and cache the data.
        .then((journeyGroups) => cacheData(journeyGroups, route, date));

      // Without awaiting it, set the pending promise in the cachingInProgress object
      // so that other instances of this component can await it.
      set(cachingInProgress, cacheKey, cachingPromise);
    }

    // Await the caching promise we got
    const cachedResult = await cachingPromise;
    // When done, clear the promise so that future fetches may take place.
    set(cachingInProgress, cacheKey, null);

    return cachedResult;
  };

  // Mobxify the promise. This will give it an observable .value property and
  // the case() method that we use in the render function below.
  return fromPromise(getData());
};

const emptyCachePromise = () => fromPromise.resolve([]);

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

    getComponent = (positions, loading) => (
      <Component {...this.props} loading={loading} positions={positions} />
    );

    render() {
      this.updateCachePromise();

      // Use the mobxified promise
      return this.cachePromise.case({
        pending: () => this.getComponent([], true),
        rejected: (error) => {
          console.error(error);
          return this.getComponent([], false);
        },
        fulfilled: (positions) => this.getComponent(positions, false),
      });
    }
  }

  return WithHfpData;
};
