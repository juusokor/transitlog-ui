import React from "react";
import {Polyline} from "react-leaflet";

const RouteLayer = ({positions}) => {
  const coords = positions.map(([lon, lat]) => [lat, lon]);
  return <Polyline positions={coords} />;
};

export default RouteLayer;
