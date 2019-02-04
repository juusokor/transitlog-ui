const React = require("react");
const ReactLeaflet = jest.requireActual("react-leaflet");

// Mock React-Leaflet's SVG components here because JSDom does not support them.

const Polyline = ({positions}) => (
  <div>{positions.map((p) => p.join(",")).join(",")}</div>
);

module.exports = {
  ...ReactLeaflet,
  Polyline,
};
