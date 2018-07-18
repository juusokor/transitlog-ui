import React from "react";
import {Polyline} from "react-leaflet";

const HfpLayer = ({positions}) => {
  const coords = positions
    .filter(pos => !!pos.lat && !!pos.long)
    .map(({lat, long}) => {
      return [lat, long]
    });

  return <Polyline pane="hfp" color={"green"} positions={coords} />;
};

export default HfpLayer;
