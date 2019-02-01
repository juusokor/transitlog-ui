import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {cleanup} from "react-testing-library";
import JourneyPosition from "./JourneyPosition";
import {renderComponent} from "../__tests__/util/renderComponent";
import {ObservableMap, observable} from "mobx";

describe("JourneyPosition", () => {
  const {component, onBeforeEach} = renderComponent((props) => (
    <JourneyPosition {...props} />
  ));

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Finds the event that matches the current time.", () => {
    const positions = [
      {
        journeyId: "test",
        events: [
          {received_at_unix: 1},
          {received_at_unix: 2},
          {received_at_unix: 3},
        ],
      },
    ];

    // Return null from the mock to appease React.
    const childrenMock = jest.fn().mockReturnValue(null);

    component({
      positions,
      // This component is a HoC that calls children as a function with the result
      children: childrenMock,
      state: {
        live: false,
        unixTime: 2, // Query for an event matching time 2.
      },
    });

    expect(childrenMock).toHaveBeenCalledTimes(1);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(ObservableMap);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "received_at_unix",
      2 // It selects the event with time 2.
    );
  });

  test("Finds an event close to the current time if no events match perfectly", () => {
    const positions = [
      {
        journeyId: "test",
        events: [
          {received_at_unix: 10},
          {received_at_unix: 20},
          {received_at_unix: 30},
        ],
      },
    ];

    const childrenMock = jest.fn().mockReturnValue(null);

    component({
      positions,
      children: childrenMock,
      state: {
        live: false,
        unixTime: 22, // Query for an event matching time 22.
      },
    });

    expect(childrenMock).toHaveBeenCalledTimes(1);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(ObservableMap);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "received_at_unix",
      20 // 20 is the closest time to 22 in the array of events
    );
  });

  test("Returns the most recent event while live-updating", () => {
    const positions = [
      {
        journeyId: "test",
        events: [
          {received_at_unix: 10},
          {received_at_unix: 20},
          {received_at_unix: 30},
        ],
      },
    ];

    const childrenMock = jest.fn().mockReturnValue(null);

    component({
      positions,
      children: childrenMock,
      state: {
        // Tell the component that we're live-updating and that the time is current (ie real time)
        live: true,
        timeIsCurrent: true,
        // The time only matters for the computed timeIsCurrent property.
        // Since we're faking it, the time doesn't matter in this case.
        unixTime: 1,
      },
    });

    expect(childrenMock).toHaveBeenCalledTimes(1);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(ObservableMap);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "received_at_unix",
      30 // 30 is the time of the most recent event.
    );
  });

  test("Ensure updated positions are indexed", () => {
    const initialPositions = [
      {
        journeyId: "test",
        events: [
          {received_at_unix: 10},
          {received_at_unix: 20},
          {received_at_unix: 30},
        ],
      },
    ];

    // The positions are re-indexed when the time changes, so we need observable state.
    const state = observable({
      live: false,
      unixTime: 20, // Query for an event matching time 20.
    });

    const childrenMock = jest.fn().mockReturnValue(null);

    component({
      positions: initialPositions,
      children: childrenMock,
      state,
    });

    expect(childrenMock).toHaveBeenCalledTimes(1);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(ObservableMap);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "received_at_unix",
      20
    );

    const updatedPositions = [
      {
        journeyId: "test",
        events: [
          {received_at_unix: 100},
          {received_at_unix: 110},
          {received_at_unix: 120},
        ],
      },
    ];

    // Rerender the component
    component({
      positions: updatedPositions,
      children: childrenMock,
      state,
    });

    // Mobx magic to reindex the positions
    state.unixTime = 120;

    expect(childrenMock).toHaveBeenCalledTimes(2);
    expect(childrenMock.mock.calls[0][0]).toBeInstanceOf(ObservableMap);
    expect(childrenMock.mock.calls[0][0].get("test")).toHaveProperty(
      "received_at_unix",
      120 // 30 is the time of the most recent event.
    );
  });
});
