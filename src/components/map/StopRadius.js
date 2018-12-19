import {Circle} from "react-leaflet";
import React from "react";

export function StopRadius({center, radius, children, color}) {
  return (
    <Circle
      center={center}
      weight={1}
      opacity={0.33}
      color={color}
      fillColor={color}
      fillOpacity={0.1}
      radius={radius}>
      {children}
    </Circle>
  );
}
