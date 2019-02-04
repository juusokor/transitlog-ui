import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";

console.log(Polyline);

class RouteLayer extends Component {
  currentRouteId = "";

  componentDidMount() {
    this.updateBounds();
  }

  componentDidUpdate() {
    this.updateBounds();
  }

  updateBounds = () => {
    const {routeId} = this.props;

    if (routeId !== this.currentRouteId) {
      this.currentRouteId = routeId;
      this.setBounds();
    }
  };

  setBounds() {
    const {routeGeometry, setMapBounds = () => {}} = this.props;

    if (routeGeometry.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(routeGeometry, [
      60.170988,
      24.940842,
    ]);

    setMapBounds(bounds);
  }

  render() {
    const {routeGeometry} = this.props;

    return (
      <Polyline
        pane="route-lines"
        weight={3}
        positions={routeGeometry}
        color="var(--blue)"
      />
    );
  }
}

export default RouteLayer;
