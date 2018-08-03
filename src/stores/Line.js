import {observable} from "mobx";

export default (lineData) => {
  const {lineId, dateBegin, dateEnd} = lineData;

  return observable({
    ...lineData,
    lineIdentifier: `${lineId}_${dateBegin}_${dateEnd}`,
  });
};
