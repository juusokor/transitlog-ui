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

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    getGroupedByVehicle = (positions) =>
      this.groupCache("vehicles", () =>
        getGrouped(positions, "uniqueVehicleId", "vehicleId")
      );

    getGroupedByJourney = (positions) =>
      this.groupCache("journeys", () =>
        getGrouped(positions, getJourneyId, "journeyId")
      );

    groupCache = (cacheKey, cacheFunc) => {
      const hfpCacheKey = this.getCacheKey();

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

    getCacheKey = () => {
      const {
        state: {date},
        route,
      } = this.props;

      if (
        !get(route, "routeId", "") ||
        !get(route, "direction", "") ||
        !get(route, "dateBegin", "")
      ) {
        return false;
      }

      return getCacheKey(date, route);
    };

    @computed
    get cachedHfp() {
      const cacheKey = this.getCacheKey();

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

    getComponent = (positions, loading) => (
      <Component
        {...this.props}
        loading={loading}
        positionsByVehicle={this.getGroupedByVehicle(positions)}
        positionsByJourney={this.getGroupedByJourney(positions)}
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
              return this.getComponent([], loading);
            }

            const formattedPositions = formatData(hfpPositions);
            cacheData(formattedPositions, date, route);

            return this.getComponent(formattedPositions, loading);
          }}
        </HfpQuery>
      ) : (
        this.getComponent(cachedHfp, false)
      );
    }
  }

  return WithHfpData;
};
