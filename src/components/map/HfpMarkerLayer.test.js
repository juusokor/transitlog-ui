import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import HfpMarkerLayer from "./HfpMarkerLayer";
import {Map, TileLayer, Pane} from "react-leaflet";
import {render, fireEvent, cleanup} from "react-testing-library";
import VehicleMarker from "./VehicleMarker";

describe("HfpMarkerLayer", () => {
  afterEach(cleanup);

  test("Renders a marker for a journey", async () => {
    const position = {
      lat: 60,
      long: 30,
      received_at: "2019-01-31T12:14:30.000Z",
      unique_vehicle_id: "01/1111",
      spd: 10,
      next_stop_id: "1234567",
      route_id: "1001",
      direction_id: 1,
      mode: "BUS",
    };

    const onClick = jest.fn();
    const {lat, long} = position;
    const markerRef = React.createRef();

    render(
      <Map center={[lat, long]} zoom={13}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Pane name="hfp-markers" style={{zIndex: 430}} />
        <HfpMarkerLayer
          ref={markerRef}
          currentPosition={position}
          onMarkerClick={onClick}
        />
      </Map>
    );

    // Nice path
    expect(markerRef.current.markerRef.current.leafletElement._latlng).toEqual({
      lat,
      lng: long,
    });

    fireEvent.click(markerRef.current.markerRef.current.leafletElement._icon);

    return expect(onClick).toHaveBeenCalledWith(position);
  });

  test("The icon gets the correct color and vehicle icon", () => {
    const position = {
      lat: 60,
      long: 30,
      received_at: "2019-01-31T12:14:30.000Z",
      unique_vehicle_id: "01/1111",
      spd: 10,
      hdg: 45,
      next_stop_id: "1234567",
      route_id: "1001",
      direction_id: 1,
      mode: "bus",
    };

    const {getByTestId} = render(<VehicleMarker position={position} />);

    expect(getByTestId("hfp-marker-icon")).toHaveStyleRule(
      "background-color",
      "var(--bus-blue)"
    );

    expect(getByTestId("icon-icon").className).toContain("BUS");
    expect(getByTestId("icon-rotation")).toHaveStyleRule(
      "transform",
      "rotate(45deg)"
    );
  });
});
