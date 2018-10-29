import BusIcon from "../icons/Bus";
import TramIcon from "../icons/Tram";
import RailIcon from "../icons/Rail";
import React from "react";
import get from "lodash/get";

export const transportIcon = {
  BUS: BusIcon,
  TRUNK: BusIcon,
  TRAM: TramIcon,
  RAIL: RailIcon,
};

export const transportColor = {
  BUS: "var(--bus-blue)",
  TRUNK: "var(--orange)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
};

export const TransportIcon = ({mode = ""}) => {
  if (!mode || typeof mode !== "string") {
    return null;
  }

  return React.createElement(get(transportIcon, mode, null), {
    fill: get(transportColor, mode, "var(--light-grey)"),
    width: "16",
    height: "16",
  });
};
