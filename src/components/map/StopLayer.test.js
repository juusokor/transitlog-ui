import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {cleanup, waitForElement} from "react-testing-library";
import StopLayer from "./StopLayer";
import {renderComponent} from "../../__tests__/util/renderComponent";
import {MockedProvider} from "react-apollo/test-utils";
import {stopsByBboxQuery} from "../../queries/StopsByBboxQuery";
import stopsByBboxQuery_grouped_Response from "../../__tests__/stopsByBboxQuery_grouped_Response.json";
import stopsByBboxQuery_single_Response from "../../__tests__/stopsByBboxQuery_single_Response.json";
import {Provider} from "mobx-react";
import {Map, TileLayer, Pane} from "react-leaflet";

jest.mock("./StopMarker");
jest.mock("./CompoundStopMarker");

const compoundStopMarkerMock = jest.requireMock("./CompoundStopMarker");
const stopMarkerMock = jest.requireMock("./StopMarker");

describe("StopLayer", () => {
  const mocks = [
    {
      request: {
        query: stopsByBboxQuery,
        variables: {
          bbox: "1,1,2,2",
        },
      },
      result: {
        data: stopsByBboxQuery_grouped_Response, // Two stops with identical coordinates
      },
    },
    {
      request: {
        query: stopsByBboxQuery,
        variables: {
          bbox: "2,2,3,3",
        },
      },
      result: {
        data: stopsByBboxQuery_single_Response, // Two stops a bit apart
      },
    },
  ];

  const {render, onBeforeEach} = renderComponent((props) => (
    <Provider state={{stop: "123"}}>
      <MockedProvider mocks={mocks} addTypename={true}>
        <Map center={[60.170988, 24.940842]} zoom={13}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Pane name="stops" style={{zIndex: 430}} />
          <StopLayer {...props} />
        </Map>
      </MockedProvider>
    </Provider>
  ));

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Renders a grouped stop marker for stops that are very close", async () => {
    // This date will trigger the mock data that contains two stops with identical coordinates

    const {getAllByTestId} = render({bounds: "1,1,2,2"});

    await waitForElement(
      () => getAllByTestId("compound-stop-marker-mock") // Added to the DOM by the stop marker mock
    );

    expect(compoundStopMarkerMock).toHaveBeenCalled();
  });

  test("Renders separate stop markers for stops that are not in the same place", async () => {
    // This date will trigger the mock data that contains two stops with different coordinates

    const {getAllByTestId} = render({bounds: "2,2,3,3"});

    await waitForElement(
      () => getAllByTestId("stop-marker-mock") // Added to the DOM by the stop marker mock
    );

    expect(stopMarkerMock).toHaveBeenCalled();
  });
});
