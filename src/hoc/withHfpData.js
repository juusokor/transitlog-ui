import {observer, inject} from "mobx-react";
import {observable, computed, runInAction} from "mobx";
import {app} from "mobx-app";
import React from "react";
import {getCachedData, cacheData, getCacheKey} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import set from "lodash/set";
import HfpQuery from "../queries/HfpQuery";
import takeEveryNth from "../helpers/takeEveryNth";
import withRoute from "./withRoute";
import getJourneyId from "../helpers/getJourneyId";

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
const hfpCache = observable.map({}, {deep: false});
let cachingInProgress = false;

@observer
class HfpCacheHelper extends React.Component {
  getGroupedByVehicle = (positions) =>
    this.groupCache("vehicles", () =>
      getGrouped(positions, "uniqueVehicleId", "vehicleId")
    );

  getGroupedByJourney = (positions) =>
    this.groupCache("journeys", () =>
      getGrouped(positions, getJourneyId, "journeyId")
    );

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

  componentDidMount() {
    this.cachePositions();
  }

  componentDidUpdate() {
    this.cachePositions();
  }

  async cachePositions() {
    const {
      cache,
      positions,
      route,
      state: {date},
    } = this.props;

    if (cache && !cachingInProgress && positions.length !== 0) {
      cachingInProgress = true;
      const formattedPositions = formatData(positions);

      // Preload the reactive cache
      const cacheKey = getCacheKey(route, date);
      runInAction(() => hfpCache.set(cacheKey, formattedPositions));

      await cacheData(formattedPositions, route, date);

      cachingInProgress = false;
    }
  }

  render() {
    const {cache, positions, component: Component, ...props} = this.props;
    const renderPositions = cache ? [] : positions;

    return (
      <Component
        {...props}
        positionsByVehicle={this.getGroupedByVehicle(renderPositions)}
        positionsByJourney={this.getGroupedByJourney(renderPositions)}
      />
    );
  }
}

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    @computed
    get cachedHfp() {
      const {
        state: {date},
        route,
      } = this.props;

      const cacheKey = getCacheKey(route, date);

      if (cacheKey) {
        const existingCache = hfpCache.get(cacheKey);

        if (!existingCache) {
          getCachedData(cacheKey).then((cachedHfp) => {
            if (
              cachedHfp &&
              cachedHfp.length !== 0 &&
              !hfpCache.get(cacheKey) // Make sure the cache is not set already
            ) {
              runInAction(() => hfpCache.set(cacheKey, cachedHfp));
            }
          });

          return [];
        }

        return existingCache;
      }

      return [];
    }

    getComponent = (positions, loading, cache = true) => (
      <HfpCacheHelper
        {...this.props}
        cache={cache}
        loading={loading}
        positions={positions}
        component={Component}
      />
    );

    render() {
      const {
        state: {date},
        route,
      } = this.props;

      const cachedHfp = this.cachedHfp;

      return !cachedHfp || cachedHfp.length === 0 ? (
        <HfpQuery route={route} date={date}>
          {({hfpPositions, loading}) => {
            if (loading || hfpPositions.length === 0) {
              return this.getComponent([], loading, false);
            }

            return this.getComponent(hfpPositions, loading, true);
          }}
        </HfpQuery>
      ) : (
        this.getComponent(cachedHfp, false, false)
      );
    }
  }

  return WithHfpData;
};
