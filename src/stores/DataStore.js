import {extendObservable} from "mobx";
import collection from "../helpers/collection";
import Stop from "./Stop";
import Route from "./Route";
import Line from "./Line";
import Hfp from "./Hfp";

export default (state) => {
  extendObservable(state, {
    stops: [],
    routes: [],
    hfp: [],
    lines: [],
  });

  const stopCollection = collection(state.stops, "stopId", Stop);
  const routeCollection = collection(state.routes, "routeIdentifier", Route);
  const hfpCollection = collection(state.hfp, "hfpIdentifier", Hfp);
  const lineCollection = collection(state.lines, "lineIdentifier", Line);

  return {
    stops: stopCollection,
    routes: routeCollection,
    hfp: hfpCollection,
    lines: lineCollection,
  };
};
