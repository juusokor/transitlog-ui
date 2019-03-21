import React from "react";
import {observer} from "mobx-react-lite";
import StopLayer from "./StopLayer";
import StopMarker from "./StopMarker";
import RouteGeometryQuery from "../../queries/RouteGeometryQuery";
import RouteLayer from "./RouteLayer";
import get from "lodash/get";
import flow from "lodash/flow";
import getJourneyId from "../../helpers/getJourneyId";
import JourneyLayer from "./JourneyLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import RouteStopsLayer from "./RouteStopsLayer";
import AreaSelect from "./AreaSelect";
import {expr} from "mobx-utils";
import {areaEventsStyles} from "../../stores/UIStore";
import SimpleHfpLayer from "./SimpleHfpLayer";
import {createRouteId} from "../../helpers/keys";
import {inject} from "../../helpers/inject";
import WeatherDisplay from "./WeatherDisplay";

const decorate = flow(
  observer,
  inject("state")
);

const MapContent = decorate(
  ({
    journeys = [],
    timePositions,
    route,
    zoom,
    mapBounds, // The current map view
    stop,
    setMapView,
    viewLocation,
    setQueryBounds,
    actualQueryBounds,
    centerOnRoute = true,
    state: {selectedJourney, time, date, mapOverlays, areaEventsStyle},
  }) => {
    const hasRoute = !!route && !!route.routeId;
    const showStopRadius = expr(() => mapOverlays.indexOf("Stop radius") !== -1);

    const selectedJourneyId = getJourneyId(selectedJourney);

    return (
      <>
        <AreaSelect
          enabled={zoom > 12}
          usingBounds={actualQueryBounds}
          onSelectArea={setQueryBounds}
        />
        {/* When a route is NOT selected... */}
        {!hasRoute && (
          <>
            {zoom > 14 ? (
              <StopLayer
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                date={date}
                bounds={mapBounds}
              />
            ) : stop ? (
              <StopMarker
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                stop={stop}
                popupOpen={true}
                date={date}
              />
            ) : null}
          </>
        )}
        {/* When a route IS selected... */}
        {hasRoute && (
          <>
            <RouteGeometryQuery
              key={`route_query_${createRouteId(route, true)}`}
              route={route}
              date={date}>
              {({routeGeometry}) =>
                routeGeometry.length !== 0 ? (
                  <RouteLayer
                    routeId={routeGeometry.length !== 0 ? createRouteId(route) : null}
                    routeGeometry={routeGeometry}
                    canCenterOnRoute={centerOnRoute}
                    setMapView={setMapView}
                    key={`route_line_${createRouteId(route, true)}`}
                  />
                ) : null
              }
            </RouteGeometryQuery>
            {(!selectedJourney ||
              (selectedJourney.route_id !== route.routeId || journeys.length === 0)) && (
              <RouteStopsLayer
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                route={route}
              />
            )}

            {journeys.length !== 0 &&
              journeys.map((journey) => {
                if (
                  selectedJourney &&
                  selectedJourney.uniqueVehicleId &&
                  get(journey, "uniqueVehicleId", "") !== selectedJourney.uniqueVehicleId
                ) {
                  return null;
                }

                const isSelectedJourney = selectedJourneyId === journey.id;
                const currentPosition = timePositions.get(journey.id);

                return [
                  isSelectedJourney ? (
                    <JourneyLayer
                      key={`journey_line_${journey.id}`}
                      events={journey.events}
                      name={journey.id}
                    />
                  ) : null,
                  isSelectedJourney ? (
                    <RouteStopsLayer
                      showRadius={showStopRadius}
                      onViewLocation={viewLocation}
                      key={`journey_stops_${journey.id}`}
                      route={route}
                      journey={journey}
                    />
                  ) : null,
                  <HfpMarkerLayer
                    key={`hfp_markers_${journey.id}`}
                    currentPosition={currentPosition}
                    journeyId={journey.id}
                    isSelectedJourney={isSelectedJourney}
                  />,
                ];
              })}
          </>
        )}
        {journeys.length !== 0 &&
          journeys
            .filter(({id}) => id !== selectedJourneyId)
            .map((journey) => {
              if (areaEventsStyle === areaEventsStyles.MARKERS) {
                const event = timePositions.get(journey.id);

                if (!event) {
                  return null;
                }

                return (
                  <HfpMarkerLayer
                    key={`hfp_markers_${journey.id}`}
                    currentPosition={event}
                    journeyId={journey.id}
                    isSelectedJourney={false}
                  />
                );
              }

              return (
                <SimpleHfpLayer
                  zoom={zoom}
                  name={journey.id}
                  key={`hfp_polyline_${journey.id}`}
                  positions={journey.events}
                />
              );
            })}
        {mapOverlays.includes("Weather") && <WeatherDisplay position={mapBounds} />}
      </>
    );
  }
);

export default MapContent;
