import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {render, cleanup, waitForElement} from "react-testing-library";
import Journeys from "./Journeys";
import {MockedProvider} from "react-apollo/test-utils";
import {routeJourneysQuery} from "../../queries/JourneysByDateQuery";
import mockJourneysResponse from "../../__tests__/route_journeys_response";
import {MobxProviders} from "../../__tests__/util/MobxProviders";

describe("Journeys", () => {
  afterEach(cleanup);

  test("Renders Journeys", async () => {
    const date = "2019-05-27";

    const state = {
      language: "fi",
      live: false,
      date,
      route: {routeId: "1018", direction: 2, originStopId: "1304130"},
    };

    const journeyMocks = [
      {
        request: {
          query: routeJourneysQuery,
          variables: {
            routeId: "1018",
            direction: 2,
            stopId: "1304130",
            date,
          },
        },
        result: mockJourneysResponse,
      },
    ];

    const {getByTestId} = render(
      <MockedProvider addTypename={true} mocks={journeyMocks}>
        <MobxProviders state={state}>
          <Journeys />
        </MobxProviders>
      </MockedProvider>
    );

    // Wait for the list to render
    const firstDepartureRow = await waitForElement(() =>
      getByTestId("journey-list-row-05:28:00")
    );

    const lastDepartureRow = getByTestId("journey-list-row-22:26:00");

    expect(firstDepartureRow).toBeInTheDocument();
    expect(firstDepartureRow).toHaveTextContent("05:28");
    expect(firstDepartureRow).toHaveTextContent("05:28:26");
    expect(firstDepartureRow).toHaveTextContent("00:26");
    expect(firstDepartureRow).toHaveTextContent("H0");

    expect(lastDepartureRow).toBeInTheDocument();
    expect(lastDepartureRow).toHaveTextContent("Ei tietoja");
    expect(lastDepartureRow).toHaveTextContent("22:26");
    expect(lastDepartureRow).toHaveTextContent("H0");
  });
});
