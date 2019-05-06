import React, {useCallback, useState} from "react";
import {createRouteId} from "../../helpers/keys";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import SuggestionInput, {SuggestionContent, SuggestionText} from "./SuggestionInput";
import getTransportType from "../../helpers/getTransportType";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import sortBy from "lodash/sortBy";
import {text} from "../../helpers/text";

const decorate = flow(
  observer,
  inject("Filters")
);

const renderSuggestion = (suggestion, {isHighlighted}) => {
  const {routeId, direction, origin, destination} = suggestion;

  return (
    <SuggestionContent
      isHighlighted={isHighlighted}
      withIcon={true}
      className={getTransportType(routeId)}>
      <SuggestionText withIcon={true}>
        <strong>{routeId}</strong> {text("domain.direction")} {direction}
        <br />
        {origin} - {destination}
      </SuggestionText>
    </SuggestionContent>
  );
};

const getFilteredSuggestions = (routes, {value = ""}) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  let [searchRouteId, searchDirection = ""] = inputValue.split("/");
  searchDirection = parseInt(searchDirection.replace(/[^0-9]*/g, "") || 0, 10);

  const filteredRoutes =
    inputLength === 0
      ? routes
      : routes.filter(
          ({routeId, direction}) =>
            (searchDirection &&
              direction === searchDirection &&
              routeId.includes(searchRouteId.slice(0, inputLength))) ||
            parseLineNumber(routeId).includes(searchRouteId.slice(0, inputLength))
        );

  return sortBy(filteredRoutes, ({routeId}) => {
    const parsedLineId = parseLineNumber(routeId);
    const numericLineId = parsedLineId.replace(/[^0-9]*/g, "");

    if (!numericLineId) {
      return getTransportType(routeId, true);
    }

    const lineNum = parseInt(numericLineId, 10);
    return getTransportType(routeId, true) + lineNum;
  });
};

export const getFullRoute = (routes, selectedRoute) => {
  const routeId =
    typeof selectedRoute === "string" ? selectedRoute : createRouteId(selectedRoute);
  return routes.find((r) => createRouteId(r) === routeId);
};

const RouteInput = decorate(({state: {route}, Filters, routes}) => {
  const [options, setOptions] = useState([]);

  const getValue = useCallback(
    (routeIdentifier) => getFullRoute(routes, routeIdentifier),
    [routes]
  );

  const onSelect = useCallback(
    (selectedValue) => {
      if (!selectedValue) {
        return Filters.setRoute({routeId: "", direction: "", originStopId: ""});
      }

      const selectedRoute = getValue(selectedValue);

      if (selectedRoute) {
        Filters.setRoute(selectedRoute);
      }
    },
    [Filters, options]
  );

  const getSuggestions = useCallback(
    (value) => {
      const nextOptions = getFilteredSuggestions(routes, value);
      setOptions(nextOptions);
    },
    [routes]
  );

  const hasRoutes = routes.length > 0;

  return (
    <SuggestionInput
      disabled={!hasRoutes}
      helpText="Select route"
      minimumInput={0}
      value={getValue(route)}
      onSelect={onSelect}
      getValue={getValue}
      getScalarValue={(val) => (typeof val === "string" ? val : createRouteId(val))}
      renderSuggestion={renderSuggestion}
      suggestions={options.slice(0, 50)}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});

export default RouteInput;
