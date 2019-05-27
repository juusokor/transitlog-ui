import React, {useCallback, useState, useMemo} from "react";
import {createRouteId} from "../../helpers/keys";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionAlerts,
} from "./SuggestionInput";
import getTransportType from "../../helpers/getTransportType";
import {parseLineNumber} from "../../helpers/parseLineNumber";
import sortBy from "lodash/sortBy";
import {text} from "../../helpers/text";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";

const decorate = flow(
  observer,
  inject("Filters")
);

const renderSuggestion = (date) => (suggestion, {isHighlighted}) => {
  const {routeId, direction, origin, destination} = suggestion;
  const suggestionAlerts = getAlertsInEffect(suggestion, date);

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
      {suggestionAlerts.length !== 0 && <SuggestionAlerts alerts={suggestionAlerts} />}
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
      : routes.filter(({mode, routeId, direction, originStopId}) => {
          const matchRouteId = routeId
            .trim()
            .replace(/\s/g, "")
            .toLowerCase();

          const matchMode = mode.toLowerCase();

          return (
            (searchDirection &&
              direction === searchDirection &&
              matchRouteId.includes(searchRouteId)) ||
            (!searchDirection && matchRouteId.includes(searchRouteId)) ||
            parseLineNumber(matchRouteId).includes(searchRouteId.slice(0, inputLength)) ||
            matchMode.startsWith(searchRouteId) ||
            originStopId.startsWith(searchRouteId)
          );
        });

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

const RouteInput = decorate(({state: {route, date}, Filters, routes}) => {
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

  const suggestionRenderFn = useMemo(() => renderSuggestion(date), [date]);

  return (
    <SuggestionInput
      disabled={!hasRoutes}
      helpText="Select route"
      minimumInput={0}
      value={getValue(route)}
      onSelect={onSelect}
      getValue={getValue}
      getScalarValue={(val) => (typeof val === "string" ? val : createRouteId(val))}
      renderSuggestion={suggestionRenderFn}
      suggestions={options.slice(0, 50)}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});

export default RouteInput;
