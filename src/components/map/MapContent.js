import React from "react";
import {observer} from "mobx-react-lite";
import StopLayer from "./StopLayer";
import StopMarker from "./StopMarker";
import RouteGeometryQuery from "../../queries/RouteGeometryQuery";
import RouteLayer from "./RouteLayer";
import get from "lodash/get";
import flow from "lodash/flow";
import getJourneyId from "../../helpers/getJourneyId";
import HfpLayer from "./HfpLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import RouteStopsLayer from "./RouteStopsLayer";
import AreaSelect from "./AreaSelect";
import {expr} from "mobx-utils";
import {areaEventsStyles} from "../../stores/UIStore";
import SimpleHfpLayer from "./SimpleHfpLayer";
import {createRouteKey} from "../../helpers/keys";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";

const decorate = flow(
  observer,
  inject("state")
);

const MapContent = decorate(
  ({
    journeys = [],
    journeyStops,
    timePositions,
    route,
    zoom,
    stopsBbox,
    stop,
    setMapBounds,
    viewLocation,
    queryBounds,
    state: {selectedJourney, date, time, mapOverlays, areaEventsStyle},
  }) => {
    const [weather, weatherLoading] = useWeather(stopsBbox, date, time);
    console.log(weather);

    const hasRoute = !!route && !!route.routeId;
    const showStopRadius = expr(() => mapOverlays.indexOf("Stop radius") !== -1);

    const selectedJourneyId = getJourneyId(selectedJourney);

    return (
      <>
        <AreaSelect enabled={zoom > 12} onSelectArea={queryBounds} />
        {/* When a route is NOT selected... */}
        {!hasRoute && (
          <>
            {zoom > 14 ? (
              <StopLayer
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                date={date}
                bounds={stopsBbox}
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
              key={`route_query_${createRouteKey(route, true)}`}
              route={route}>
              {({routeGeometry}) =>
                routeGeometry.length !== 0 ? (
                  <RouteLayer
                    routeId={
                      routeGeometry.length !== 0 ? createRouteKey(route) : null
                    }
                    routeGeometry={routeGeometry}
                    setMapBounds={setMapBounds}
                    key={`route_line_${createRouteKey(route, true)}`}
                  />
                ) : null
              }
            </RouteGeometryQuery>
            {(!selectedJourney ||
              (selectedJourney.route_id !== route.routeId ||
                journeys.length === 0)) && (
              <RouteStopsLayer
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                route={route}
              />
            )}

            {journeys.length !== 0 &&
              journeys.map(({events: journeyPositions, journeyId}) => {
                if (
                  selectedJourney &&
                  selectedJourney.unique_vehicle_id &&
                  get(journeyPositions, "[0].unique_vehicle_id", "") !==
                    selectedJourney.unique_vehicle_id
                ) {
                  return null;
                }

                const isSelectedJourney = selectedJourneyId === journeyId;
                const currentPosition = timePositions.get(journeyId);

                return [
                  isSelectedJourney ? (
                    <HfpLayer
                      key={`hfp_line_${journeyId}`}
                      selectedJourney={selectedJourney}
                      positions={journeyPositions}
                      name={journeyId}
                    />
                  ) : null,
                  isSelectedJourney ? (
                    <RouteStopsLayer
                      showRadius={showStopRadius}
                      onViewLocation={viewLocation}
                      key={`journey_stops_${journeyId}`}
                      route={route}
                      journeyStops={journeyStops}
                    />
                  ) : null,
                  <HfpMarkerLayer
                    key={`hfp_markers_${journeyId}`}
                    currentPosition={currentPosition}
                    journeyId={journeyId}
                    isSelectedJourney={isSelectedJourney}
                  />,
                ];
              })}
          </>
        )}
        {journeys.length !== 0 &&
          journeys
            .filter(({journeyId}) => journeyId !== selectedJourneyId)
            .map(({journeyId, events}) => {
              if (areaEventsStyle === areaEventsStyles.MARKERS) {
                const event = timePositions.get(journeyId);

                if (!event) {
                  return null;
                }

                return (
                  <HfpMarkerLayer
                    key={`hfp_markers_${journeyId}`}
                    currentPosition={event}
                    journeyId={journeyId}
                    isSelectedJourney={false}
                  />
                );
              }

              return (
                <SimpleHfpLayer
                  zoom={zoom}
                  name={journeyId}
                  key={`hfp_polyline_${journeyId}`}
                  positions={events}
                />
              );
            })}
      </>
    );
  }
);

export default MapContent;
