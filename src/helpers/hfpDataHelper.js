import groupBy from "lodash/groupBy";
import map from "lodash/map";
import takeEveryNth from "./takeEveryNth";
import * as JSONC from "./JSONC";

export default () => {
  function getCacheKey(date, route) {
    const {routeId, direction} = route;
    return `${date}.${routeId}.${direction}`;
  }

  function formatData(hfpData) {
    if (!hfpData || hfpData.length === 0) {
      return hfpData;
    }

    let data = groupBy(data, "uniqueVehicleId");
    data = map(data, (positions, groupName) => ({
      vehicleId: groupName,
      positions,
    }));

    return data;
  }

  function cacheData(hfpData, date, route) {
    if (!hfpData || hfpData.length === 0) {
      return;
    }

    const key = getCacheKey(date, route);
    const data = JSONC.pack(hfpData, true); // Compress json

    try {
      window.localStorage.setItem(key, data);
    } catch (e) {
      window.localStorage.clear();
      window.localStorage.setItem(key, data);
    }
  }

  function getCachedData(date, route) {
    const key = getCacheKey(date, route);
    const stored = window.localStorage.getItem(key);

    if (!stored) {
      return [];
    }

    return JSONC.unpack(stored, true);
  }

  return {
    cacheData,
    formatData,
    getCachedData,
  };
};
