import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import {getCacheKey} from "../helpers/hfpCache";
import {fromPromise} from "mobx-utils";
import withRoute from "./withRoute";
import {fetchHfp} from "../helpers/hfpQueryManager";

// Returns a mobxified promise that resolves to
// either cached hfp data or fetched hfp data.
const getCachePromise = (route, date, time) => {
  // Mobxify the promise. This will give it an observable .value property and
  // the case() method that we use in the render function below.
  return fromPromise(fetchHfp(route, date, time));
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
        state: {date, time},
      } = this.props;

      const cacheKey = getCacheKey(route, date);
      let setPromise = emptyCachePromise();

      // If we have a valid cacheKey (ie there is a route selected), and the key is
      // currently not in use, update the cache promise to fetch the current route.
      if (cacheKey && cacheKey !== this.currentCacheKey) {
        setPromise = getCachePromise(route, date, time);
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
