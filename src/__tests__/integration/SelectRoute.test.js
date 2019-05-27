import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {render, cleanup, waitForElement, waitForDomChange} from "react-testing-library";
import Journeys from "../../components/sidepanel/Journeys";
import {MockedProvider} from "react-apollo/test-utils";
import {routeJourneysQuery} from "../../queries/JourneysByDateQuery";
import mockJourneysResponse from "../route_journeys_response";
import {MobxProviders} from "../util/MobxProviders";
import {observable} from "mobx";
import filterActions from "../../stores/filterActions";

const date = "2019-05-27";

const routeDepartureMocks = [
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

describe("When a route is selected", () => {
  const route = {routeId: "1018", direction: 2, originStopId: "1304130"};

  const state = observable({
    language: "fi",
    live: false,
    date,
    route: {routeId: "", direction: "", originStopId: ""},
  });

  const renderJourneys = () =>
    render(
      <MobxProviders state={state}>
        <MockedProvider addTypename={true} mocks={routeDepartureMocks}>
          <Journeys />
        </MockedProvider>
      </MobxProviders>
    );

  afterEach(cleanup);

  test("Fetches and renders a list of the route's departures", async () => {
    const {getByTestId} = renderJourneys();
    filterActions(state).setRoute(route);

    // Wait for the list to render
    const firstDepartureRow = await waitForElement(() =>
      getByTestId("journey-list-row-05:28:00")
    );

    const lastDepartureRow = getByTestId("journey-list-row-22:26:00");

    expect(firstDepartureRow).toBeInTheDocument();
    expect(firstDepartureRow).toHaveTextContent("05:28"); // The planned departure time
    expect(firstDepartureRow).toHaveTextContent("05:28:26"); // The observed departure time
    expect(firstDepartureRow).toHaveTextContent("00:26"); // The observed difference
    expect(firstDepartureRow).toHaveTextContent("H0"); // The special dayType

    expect(lastDepartureRow).toBeInTheDocument();
    expect(lastDepartureRow).toHaveTextContent("Ei tietoja");
    expect(lastDepartureRow).toHaveTextContent("22:26");
    expect(lastDepartureRow).toHaveTextContent("H0");
  });
});
