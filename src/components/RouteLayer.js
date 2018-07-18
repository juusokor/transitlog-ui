import React from "react";
import {Polyline, Circle} from "react-leaflet";

const RouteLayer = ({positions, stops}) => {
  const coords = positions.map(([lon, lat]) => [lat, lon]);
  return [
    <Polyline positions={coords} />,
    <Circle center={[60.17, 24.92]} color="red" radius={20} />,
  ];
};

export default RouteLayer;
