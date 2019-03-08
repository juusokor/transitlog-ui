import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import {observer} from "mobx-react";

@observer
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
    const {
      canCenterOnRoute = true,
      routeGeometry,
      setMapBounds = () => {},
    } = this.props;

    if (!canCenterOnRoute || routeGeometry.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(routeGeometry);
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
