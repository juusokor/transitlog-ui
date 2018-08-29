import {observer, inject} from "mobx-react";
import {observable, computed, runInAction, action} from "mobx";
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
    takeEveryNth(hfpData, 3) // Take every other hfp item.
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
        // Cache the data...
        .then((formattedData) => cacheData(formattedData, route, date));

      // Without awaiting it, set the pending promise in the cachingInProgress object
      // so that other instances of this component can await it.
      set(cachingInProgress, cacheKey, cachingPromise);
    }

    // Await the caching promise we got
    const cachedResult = await cachingPromise;
    // When done, clear the promise so that future fetches might take place.
    set(cachingInProgress, cacheKey, null);

    return cachedResult;
  };

  // Mobxify the promise. This will give it an observable .value property and
  // the case() method that we use in the render function below.
  return fromPromise(getData());
};

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    currentCacheKey = ""; // Keep track of the current cachekey to prevent update loops.

    @observable.ref
    cachePromise = fromPromise.resolve([]); // Initially an empty array

    componentDidMount() {
      this.updateCachePromise();
    }

    componentDidUpdate() {
      this.updateCachePromise();
    }

    @action
    updateCachePromise() {
      const {
        route,
        state: {date},
      } = this.props;

      const cacheKey = getCacheKey(route, date);

      // If we have a valid cachekey (ie there is a route selected), and the key is
      // currently not in use, update the cache promise to fetch the current route.
      if (cacheKey && cacheKey !== this.currentCacheKey) {
        this.currentCacheKey = cacheKey;
        this.cachePromise = getCachePromise(route, date);
      }
    }

    getGroupedByVehicle = (positions) =>
      this.groupCache("vehicles", () =>
        getGrouped(positions, "uniqueVehicleId", "vehicleId")
      );

    getGroupedByJourney = (positions) =>
      this.groupCache("journeys", () =>
        getGrouped(positions, getJourneyId, "journeyId")
      );

    // This cache is separate from the hfp stuff above. It caches the computed
    // hfp data groupings, by journey or by vehicle.
    groupCache = (cacheKey, cacheFunc) => {
      const {
        state: {date},
        route,
      } = this.props;
      const hfpCacheKey = getCacheKey(route, date);

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

    getComponent = (positions, loading) => (
      <Component
        {...this.props}
        loading={loading}
        positionsByVehicle={this.getGroupedByVehicle(positions)}
        positionsByJourney={this.getGroupedByJourney(positions)}
      />
    );

    render() {
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
