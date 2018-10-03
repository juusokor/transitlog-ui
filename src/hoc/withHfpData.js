import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import {canFetchHfp, createFetchKey} from "../helpers/hfpCache";
import {fromPromise} from "mobx-utils";
import withRoute from "./withRoute";
import {fetchHfp, getTimeRange} from "../helpers/hfpQueryManager";

// Returns a mobxified promise that resolves to
// either cached hfp data or fetched hfp data.
const getCachePromise = (route, date, time, marginMinutes) => {
  // Mobxify the promise. This will give it an observable .value property and
  // the case() method that we use in the render function below.
  return fromPromise(fetchHfp(route, date, time, marginMinutes));
};

const emptyCachePromise = () => fromPromise.resolve([]);

// To use while the promise is loading
let previouslyResolvedPositions = [];

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    currentFetchKey = false;
    cachedPositions = {};

    async updateCachePromise() {
      const {
        route,
        state: {date, time, marginMinutes},
      } = this.props;

      const canFetch = canFetchHfp(route, date);
      let setPromise = emptyCachePromise();

      let fetchKey = false;

      // If we have a valid cacheKey (ie there is a route selected), and the key is
      // currently not in use, update the cache promise to fetch the current route.
      if (canFetch) {
        fetchKey = createFetchKey(
          route,
          date,
          getTimeRange(date, time, marginMinutes)
        );

        if (fetchKey && fetchKey !== this.currentFetchKey) {
          setPromise = getCachePromise(route, date, time, marginMinutes);
        }
      }

      // Always update the promise if the current cache key doesn't match the new one.
      // This allows for empty cache promises to be set, even if the above condition doesn't run.
      if (!canFetch || fetchKey !== this.currentFetchKey) {
        this.currentFetchKey = fetchKey;
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
        pending: () => this.getComponent(previouslyResolvedPositions, true),
        rejected: (error) => {
          console.error(error);
          return this.getComponent(previouslyResolvedPositions, false);
        },
        fulfilled: (positions) => {
          previouslyResolvedPositions = positions;
          return this.getComponent(positions, false);
        },
      });
    }
  }

  return WithHfpData;
};
