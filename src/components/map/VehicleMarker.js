import React from "react";
import {createPortal} from "react-dom";
import get from "lodash/get";

// Creates a portal that renders the vehicle markers

class VehicleMarker extends React.Component {
  render() {
    const {parent, position, color} = this.props;

    return createPortal(
      <span className="hfp-marker-wrapper" style={{backgroundColor: color}}>
        <div
          className={`hfp-marker-icon ${get(position, "mode", "").toUpperCase()}`}
          style={{transform: `rotate(${position.hdg - 180}deg)`}}
        />
        {position.drst && <span className="hfp-marker-drst" />}
        <span
          className="hfp-marker-heading"
          style={{
            transform: `rotate(${position.hdg}deg) translate(0, -82%)`,
            borderBottomColor: color,
          }}
        />
      </span>,
      parent
    );
  }
}

export default VehicleMarker;
