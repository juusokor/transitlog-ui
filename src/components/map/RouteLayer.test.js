/* eslint-disable import/first */
jest.unmock("react-leaflet");
const {Map, TileLayer, Pane} = jest.requireActual("react-leaflet");

import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {cleanup} from "react-testing-library";
import RouteLayer from "./RouteLayer";
import {renderComponent} from "../../__tests__/util/renderComponent";

describe("RouteLayer", () => {
  const {render, onBeforeEach} = renderComponent(function getComponent(props) {
    console.log(TileLayer);

    return (
      <Map center={[60.170988, 24.940842]} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Pane name="route-lines" style={{zIndex: 430}} />
        <RouteLayer {...props} />
      </Map>
    );
  });

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Renders RouteLayer with coordinates", () => {
    const coordinates = [[0, 0], [4, 0], [4, 4], [0, 4]];
    const setBounds = jest.fn();

    const {getByText} = render({
      routeGeometry: coordinates,
      setMapBounds: setBounds,
    });

    expect(getByText("0,0,4,0,4,4,0,4")).toBeInTheDocument();
    expect(setBounds).toHaveBeenCalled();
  });
});
