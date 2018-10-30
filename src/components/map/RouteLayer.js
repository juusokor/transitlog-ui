import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import {Observer} from "mobx-react";
import {observable, action} from "mobx";

class RouteLayer extends Component {
  @observable.ref
  geometry = [];
  currentRouteId = "";

  componentDidMount() {
    this.updateGeometry();
  }

  componentDidUpdate() {
    this.updateGeometry();
  }

  @action
  updateGeometry = () => {
    const {routeGeometry, routeId} = this.props;

    if (routeGeometry.length !== 0 && routeId !== this.currentRouteId) {
      this.geometry = routeGeometry.map(([lon, lat]) => [lat, lon]);
      this.currentRouteId = routeId;

      this.setBounds();
    }
  };

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
      <Observer>
        {() => (
          <Polyline
            pane="route-lines"
            weight={3}
            positions={this.geometry}
            color="var(--blue)"
          />
        )}
      </Observer>
    );
  }
}

export default RouteLayer;
