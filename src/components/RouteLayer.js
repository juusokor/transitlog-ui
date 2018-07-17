import React from "react";
import {Polyline} from "react-leaflet";

const RouteLayer = ({line}) => {
  const coords = line.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  return <Polyline positions={coords} />;
};

export default RouteLayer;
