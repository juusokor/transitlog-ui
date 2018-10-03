import React from "react";
import * as Mapillary from "mapillary-js";
import "mapillary-js/dist/mapillary.min.css";

const MAPILLARY_ELEMENT_ID = "mapillary-viewer";

class MapillaryViewer extends React.Component {
  mly = null;

  componentDidMount() {
    const {location} = this.props;

    this.initMapillary();
    this.showLocation(location);
  }

  componentDidUpdate(prevProps) {
    const {location} = this.props;
    const prevLocation = prevProps.location;

    if (!location.equals(prevLocation)) {
      this.showLocation(location);
    }
  }

  showLocation(location) {
    if (!this.mly) {
      this.initMapillary();
    }

    if (this.mly.isNavigable) {
      this.mly.moveCloseTo(location.lat, location.lng);
    }
  }

  initMapillary() {
    const {onNavigation} = this.props;

    this.mly = new Mapillary.Viewer(
      MAPILLARY_ELEMENT_ID,
      "V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw",
      null,
      {
        component: {
          cover: false,
        },
      }
    );

    this.mly.on(Mapillary.Viewer.nodechanged, onNavigation);
    window.addEventListener("resize", this.onResize);
  }

  onResize = () => {
    if (this.mly) {
      this.mly.resize();
    }
  };

  componentWillUnmount() {
    this.mly = null;
    window.removeEventListener("resize", this.onResize);
  }

  render() {
    const {className} = this.props;
    return <div className={className} id={MAPILLARY_ELEMENT_ID} />;
  }
}

export default MapillaryViewer;
