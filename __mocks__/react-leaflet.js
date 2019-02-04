import React from "react";

export const Polyline = ({positions}) => (
  <div>{positions.map((p) => p.join(",")).join(",")}</div>
);
