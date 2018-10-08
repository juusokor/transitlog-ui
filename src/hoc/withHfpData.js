import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import get from "lodash/get";
import {createFetchKey} from "../helpers/hfpCache";
import {fromPromise} from "mobx-utils";
import withRoute from "./withRoute";
import {fetchHfp} from "../helpers/hfpQueryManager";
import {getTimeRange} from "../helpers/time";
import {combineDateAndTime} from "../helpers/time";
import parse from "date-fns/parse";

const emptyCachePromise = () => fromPromise.resolve([]);

// To use while the promise is loading
let previouslyResolvedPositions = [];

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    currentFetchKey = false;
    cachePromise = emptyCachePromise();

    // Creates a promise for awaiting the hfp result from the API or the cache.
    // React can't render async yet, so some mechanism to update the view when
    // an async result comes back is required. Remember that this runs *per instance*,
    // so the vast majority of work should be done in the `fetchHfp` method that runs
    // once for all instances when required.
    updateCachePromise = () => {
      const {
        route,
        state: {date, time, selectedJourney},
      } = this.props;

      if (this.cachePromise.state === "pending") {
        return;
      }

      const useTime = get(selectedJourney, "journey_start_time", time);
      const timeMoment = combineDateAndTime(date, useTime, "Europe/Helsinki");

      const timeRange = getTimeRange(timeMoment);
      const fetchKey = createFetchKey(route, date, timeRange);
      let setPromise;

      // If we have a valid cacheKey (ie there is a route selected), and the key is
      // currently not in use, update the cache promise to fetch the current route.
      if (fetchKey && fetchKey !== this.currentFetchKey) {
        setPromise = fromPromise(fetchHfp(route, date, timeRange));
      } else if (fetchKey !== this.currentFetchKey) {
        setPromise = emptyCachePromise();
      }

      // Always update the promise if the current cache key doesn't match the new one.
      // This allows for empty cache promises to be set, even if the above condition doesn't run.
      // This is needed to update the view when the route changes or filters reset.
      if (fetchKey !== this.currentFetchKey) {
        this.currentFetchKey = fetchKey;
        this.cachePromise = setPromise;
      }
    };

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
