import {observable} from "mobx";

export default (hfpData) => {
  const {receivedAt, routeId, directionId} = hfpData;

  return observable({
    ...hfpData,
    hfpIdentifier: `${receivedAt}_${routeId}_${directionId}`,
  });
};
