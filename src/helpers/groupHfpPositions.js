import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";

export function groupHfpPositions(hfpData, groupKey, groupNameKey) {
  if (!hfpData || hfpData.length === 0) {
    return [];
  }

  const groupedData = groupBy(hfpData, groupKey);
  const vehicleGroups = map(groupedData, (events, groupName) => ({
    [groupNameKey]: groupName,
    journey_start_time: get(events, "[0].journey_start_time", ""),
    events,
  }));

  return vehicleGroups;
}
