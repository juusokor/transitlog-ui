import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {render, cleanup, waitForElement} from "react-testing-library";
import Journeys from "../../components/sidepanel/Journeys";
import {MockedProvider} from "react-apollo/test-utils";
import {routeJourneysQuery} from "../../queries/JourneysByDateQuery";
import mockJourneysResponse from "../route_journeys_response";
import {MobxProviders} from "../util/MobxProviders";
import {observable} from "mobx";
import filterActions from "../../stores/filterActions";
import SidePanel from "../../components/sidepanel/SidePanel";
import {text} from "../../helpers/text";

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
    sidePanelVisible: true,
    route: {routeId: "", direction: "", originStopId: ""},
  });

  const RenderContext = ({children}) => (
    <MobxProviders state={state} actions={{UI: {}}}>
      <MockedProvider addTypename={true} mocks={routeDepartureMocks}>
        {children}
      </MockedProvider>
    </MobxProviders>
  );

  const renderJourneys = () =>
    render(
      <RenderContext>
        <Journeys />
      </RenderContext>
    );
  const renderSidebar = () =>
    render(
      <RenderContext>
        <SidePanel detailsOpen={true} sidePanelOpen={true} />
      </RenderContext>
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

    // The following assertions are based on the mock response
    expect(firstDepartureRow).toBeInTheDocument();
    expect(firstDepartureRow).toHaveTextContent("05:28"); // The planned departure time
    expect(firstDepartureRow).toHaveTextContent("05:28:26"); // The observed departure time
    expect(firstDepartureRow).toHaveTextContent("00:26"); // The observed difference
    expect(firstDepartureRow).toHaveTextContent("H0"); // The special dayType

    expect(lastDepartureRow).toBeInTheDocument();
    expect(lastDepartureRow).toHaveTextContent("Ei tietoja"); // Finnish is set as the language in the state.
    expect(lastDepartureRow).toHaveTextContent("22:26");
    expect(lastDepartureRow).toHaveTextContent("H0");
  });

  test("Shows information in the sidebar", async () => {
    const {getByTestId} = renderSidebar();
    filterActions(state).setRoute(route);

    const sidepanel = await waitForElement(() => getByTestId("sidepanel"));
    expect(sidepanel).toBeInTheDocument();
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.journeys", "fi"));
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.week_journeys", "fi"));
    expect(sidepanel).toHaveTextContent(text("domain.alerts", "fi"));

    const details = await waitForElement(() => getByTestId("journey-details"));
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent("1018");
  });
});
