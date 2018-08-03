import {observable} from "mobx";

export default (routeData) => {
  const {routeId, direction, dateBegin, dateEnd} = routeData;

  return observable({
    ...routeData,
    routeIdentifier: `${routeId}_${direction}_${dateBegin}_${dateEnd}`,
  });
};
