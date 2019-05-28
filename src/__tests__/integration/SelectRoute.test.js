import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {render, cleanup, fireEvent} from "react-testing-library";
import Journeys from "../../components/sidepanel/Journeys";
import {MockedProvider} from "react-apollo/test-utils";
import {routeJourneysQuery} from "../../queries/JourneysByDateQuery";
import mockJourneysResponse from "../route_journeys_response";
import mockRouteOptionsResponse from "../route_options_response";
import {MobxProviders} from "../util/MobxProviders";
import {observable} from "mobx";
import filterActions from "../../stores/filterActions";
import SidePanel from "../../components/sidepanel/SidePanel";
import {text} from "../../helpers/text";
import {routeOptionsQuery} from "../../queries/RouteOptionsQuery";
import RouteSettings from "../../components/filterbar/RouteSettings";

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
  {
    request: {
      query: routeOptionsQuery,
      variables: {
        date: "2019-05-27",
      },
    },
    result: mockRouteOptionsResponse,
  },
];

describe("Route selection and filtering", () => {
  const route = {routeId: "1018", direction: 2, originStopId: "1304130"};
  let state = {};

  const createState = () => {
    state = observable({
      language: "fi",
      live: false,
      date,
      sidePanelVisible: true,
      route: {routeId: "", direction: "", originStopId: ""},
    });
  };

  const RenderContext = ({children}) => (
    <MobxProviders state={state} actions={{UI: {}}}>
      <MockedProvider addTypename={true} mocks={routeDepartureMocks}>
        {children}
      </MockedProvider>
    </MobxProviders>
  );

  const renderRouteSettings = () => {
    render(
      <RenderContext>
        <RouteSettings />
      </RenderContext>
    );
  };

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

  beforeEach(createState);
  afterEach(cleanup);
  
  test("Renders a list of route suggestions when input is focused", async () => {
    const {findByTestId, findByText} = renderRouteSettings();
    const routeInput = await findByTestId("route-input");
    
    // Trigger the autosuggest options
    fireEvent.focus(routeInput);
    
    // The name of the first route in the mock data
    const firstStopOption = await findByText("Marsalkantie");
    expect(firstStopOption).toBeInTheDocument();
  });
  
  test("Stop is selected when the suggestion is clicked.", async () => {
    const {findByTestId, findByText} = renderRouteSettings();
    const routeInput = await findByTestId("route-input");
    
    // Trigger the autosuggest options
    fireEvent.focus(routeInput);
    
    // The name of the first route in the mock data
    const firstStopOption = await findByText("Marsalkantie");
    
    fireEvent.click(firstStopOption);
    expect(setStopMock).toHaveBeenCalledWith("1420104");
    expect(state.route).toBe("1420104");
    
    const selectedStopDisplay = await findByTestId("selected-route-display");
    expect(selectedStopDisplay).toHaveTextContent(/^1420104/g);
    expect(selectedStopDisplay).toHaveTextContent(/Marsalkantie$/g);
  });
  
  test("The correct route is suggested when searching", async () => {
    const {findByTestId} = renderRouteSettings();
    const routeInput = await findByTestId("route-input");
    
    // Trigger the autosuggest options and do a search by the short ID
    fireEvent.focus(routeInput);
    fireEvent.change(routeInput, {target: {value: "1728"}});
    
    // Check that the name of the first suggestion matches the search term
    const suggestions = await findByTestId("route-suggestions-list");
    expect(suggestions.firstChild).toHaveTextContent("Matkamiehentie");
    
    // Clear and ensure that the list is unfiltered
    fireEvent.change(routeInput, {target: {value: ""}});
    expect(suggestions.firstChild).toHaveTextContent("Marsalkantie");
    
    // Then search again by the name of the route.
    fireEvent.change(routeInput, {target: {value: "Matkamie"}});
    expect(suggestions.firstChild).toHaveTextContent("Matkamiehentie");
    
    // Finally select the suggestion
    fireEvent.click(getByText(suggestions.firstChild, "Matkamiehentie"));
    expect(setStopMock).toHaveBeenCalledWith("1291162");
    expect(state.route).toBe("1291162");
  });

  test("Fetches and renders a list of the route's departures", async () => {
    const {findByTestId} = renderJourneys();
    filterActions(state).setRoute(route);

    // Wait for the list to render
    const firstDepartureRow = await findByTestId("journey-list-row-05:28:00");
    const lastDepartureRow = await findByTestId("journey-list-row-22:26:00");

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
    const {findByTestId} = renderSidebar();
    filterActions(state).setRoute(route);

    const sidepanel = await findByTestId("sidepanel");
    expect(sidepanel).toBeInTheDocument();
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.journeys", "fi"));
    expect(sidepanel).toHaveTextContent(text("sidepanel.tabs.week_journeys", "fi"));
    expect(sidepanel).toHaveTextContent(text("domain.alerts", "fi"));

    const details = await findByTestId("journey-details");
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent("1018");
  });
});
