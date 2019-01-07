import {Circle} from "react-leaflet";
import React from "react";

export function StopRadius({
  center,
  radius,
  children,
  color,
  isHighlighted = false,
}) {
  return (
    <Circle
      interactive={false}
      pane={isHighlighted ? "selected-stop-radius" : "stop-radius"}
      center={center}
      weight={isHighlighted ? 2 : 1}
      opacity={isHighlighted ? 0.875 : 0.33}
      color={isHighlighted ? "white" : color}
      fillColor={color}
      fillOpacity={isHighlighted ? 0.25 : 0.133}
      radius={radius}>
      {children}
    </Circle>
  );
}
