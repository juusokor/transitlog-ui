import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";

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
    const {routeGeometry, setMapView = () => {}} = this.props;

    if (routeGeometry.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(routeGeometry);
    setMapView(bounds);
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
