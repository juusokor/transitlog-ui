import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {render, cleanup} from "react-testing-library";
import {observable, action} from "mobx";
import {MobxProviders} from "../util/MobxProviders";
import {MockedProvider} from "react-apollo/test-utils";
import {allStopsQuery} from "../../queries/AllStopsQuery";
import stopMockResponse from "../stop_options_response.json";
import StopSettings from "../../components/filterbar/StopSettings";
import get from "lodash/get";

const date = "2019-05-27";

const stopRequestMocks = [
  {
    request: {
      query: allStopsQuery,
    },
    result: stopMockResponse,
  },
];

describe("Stop search and filtering", () => {
  const state = observable({
    language: "fi",
    live: false,
    date,
    stop: "",
  });

  let setStopMock = jest.fn(
    action((stop) => {
      state.stop = get(stop, "stopId", stop);
    })
  );

  const RenderContext = ({children}) => (
    <MobxProviders
      state={state}
      actions={{
        Filters: {
          setStop: (stop) => setStopMock(stop),
        },
      }}>
      <MockedProvider addTypename={true} mocks={stopRequestMocks}>
        {children}
      </MockedProvider>
    </MobxProviders>
  );

  const renderStopSettings = () =>
    render(
      <RenderContext>
        <StopSettings />
      </RenderContext>
    );

  afterEach(cleanup);

  test("Renders a list of stop suggestions when input is focused", async () => {
    const {findByTestId, findByText} = renderStopSettings();
    const stopInput = await findByTestId("stop-input");

    // Trigger the autosuggest options
    stopInput.focus();

    // The name of the first stop in the mock data
    const firstStopOption = await findByText("Marsalkantie");
    expect(firstStopOption).toBeInTheDocument();
  });
});
