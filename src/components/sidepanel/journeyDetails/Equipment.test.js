import React from "react";
import "jest-dom/extend-expect";
import "jest-styled-components";
import {cleanup, waitForElement} from "react-testing-library";

import Equipment from "./Equipment";
import {MockedProvider} from "react-apollo/test-utils";
import {vehicleTypeQuery} from "../../../queries/EquipmentQuery";
import {renderComponent} from "../../../__tests__/util/renderComponent";

const equipmentProps = {
  age: 1,
  multiAxle: 1,
  class: "A",
  registryNr: "123",
  vehicleId: "100",
};

describe("Equipment", () => {
  const mocks = [
    {
      request: {
        query: vehicleTypeQuery,
        variables: {
          vehicleId: "100",
          operatorId: "0001",
        },
      },
      result: {
        data: {
          allEquipment: {
            nodes: [
              {
                ...equipmentProps,
                type: "C",
                exteriorColor: "HSL-orans",
                operatorId: "0001",
              },
            ],
          },
        },
      },
    },
    {
      request: {
        query: vehicleTypeQuery,
        variables: {
          vehicleId: "100",
          operatorId: "0002",
        },
      },
      result: {
        data: {
          allEquipment: {
            nodes: [
              {
                ...equipmentProps,
                type: "A1",
                exteriorColor: "HSL-sin",
                operatorId: "0002",
              },
            ],
          },
        },
      },
    },
  ];

  const {component, onBeforeEach} = renderComponent((props) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Equipment {...props} />
    </MockedProvider>
  ));

  beforeEach(onBeforeEach);
  afterEach(cleanup);

  test("Renders a list of used equipment and compares it to the requirements", async () => {
    const event = {
      owner_operator_id: 1,
      vehicle_number: 100,
    };
    const departure = {
      trunkColorRequired: true, // exteriorColor must be "HSL-orans"
      equipmentRequired: 1, // The prescribed equipment is a hard requirement
      equipmentType: "0", // 0 corresponds to type C.
    };

    const {getByTestId, queryByText, baseElement} = component({
      journey: event,
      departure,
    });

    const equipment = await waitForElement(() => getByTestId("equipment-wrapper"));

    expect(equipment).toHaveTextContent("CHSL-orans");
    // Green means it's CORRECT, bold means it's a hard requirement
    expect(queryByText("C")).toHaveStyle(
      "color: var(--light-green); font-weight: bold;"
    );
    expect(queryByText("HSL-orans")).toHaveStyle(
      "color: var(--light-green); font-weight: bold;"
    );
  });

  test("Highlights mismatching equipment", async () => {
    const event = {
      owner_operator_id: 2, // Fetch the second mock equipment
      vehicle_number: 100,
    };
    const departure = {
      trunkColorRequired: true, // exteriorColor must be "HSL-orans"
      equipmentRequired: 1, // The prescribed equipment is a hard requirement
      equipmentType: "0", // 0 corresponds to type C. The equipment will have type A1 so it's an error.
    };

    const {getByTestId, queryByText} = component({
      journey: event,
      departure,
    });

    const equipment = await waitForElement(() => getByTestId("equipment-wrapper"));

    expect(equipment).toHaveTextContent("A1HSL-sin");
    // Red means it's WRONG, bold means it's a hard requirement
    expect(queryByText("A1")).toHaveStyle("color: var(--red); font-weight: bold;");
    expect(queryByText("HSL-sin")).toHaveStyle(
      "color: var(--red); font-weight: bold;"
    );
  });

  test("No highlight if the requirement is not hard", async () => {
    const event = {
      owner_operator_id: 2, // Fetch the second mock equipment
      vehicle_number: 100,
    };
    const departure = {
      trunkColorRequired: false, // exteriorColor can be whatever
      equipmentRequired: 0, // The prescribed equipment is NOT a hard requirement
      equipmentType: "0", // 0 corresponds to type C, but it's not a hard requirement in this case.
    };

    const {getByTestId, queryByText} = component({
      journey: event,
      departure,
    });

    const equipment = await waitForElement(() => getByTestId("equipment-wrapper"));

    expect(equipment).toHaveTextContent("A1HSL-sin");
    // Red means it's WRONG, bold means it's a hard requirement
    expect(queryByText("A1")).toHaveStyle(
      "color: var(--dark-grey); font-weight: normal;"
    );
    expect(queryByText("HSL-sin")).toHaveStyle(
      "color: var(--dark-grey); font-weight: normal;"
    );
  });
});
