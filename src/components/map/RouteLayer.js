import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import {observer} from "mobx-react";
import {observable, action} from "mobx";

@observer
class RouteLayer extends Component {
  @observable.ref
  geometry = [];
  currentRouteId = "";

  componentDidMount() {
    this.updateGeometry();
    this.setBounds();
  }

  componentDidUpdate() {
    this.updateGeometry();
    this.setBounds();
  }

  @action
  updateGeometry() {
    const {routeGeometry, routeId} = this.props;

    if (routeGeometry.length !== 0 && routeId !== this.currentRouteId) {
      this.geometry = routeGeometry.map(([lon, lat]) => [lat, lon]);
      this.currentRouteId = routeId;
    }
  }

  setBounds() {
    const {setMapBounds = () => {}} = this.props;

    if (this.geometry.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(this.geometry, [
      60.170988,
      24.940842,
    ]);

    setMapBounds(bounds);
  }

  render() {
    return (
      <Polyline
        pane="route-lines"
        weight={3}
        positions={this.geometry}
        color="var(--blue)"
      />
    );
  }
}

export default RouteLayer;
