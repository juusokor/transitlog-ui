import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import StopLayer from "./StopLayer";
import StopMarker from "./StopMarker";
import RouteGeometryQuery from "../../queries/RouteGeometryQuery";
import RouteLayer from "./RouteLayer";
import get from "lodash/get";
import getJourneyId from "../../helpers/getJourneyId";
import HfpLayer from "./HfpLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";
import {app} from "mobx-app";
import RouteStopsLayer from "./RouteStopsLayer";
import AreaSelect from "./AreaSelect";
import {expr} from "mobx-utils";
import {areaEventsStyles} from "../../stores/UIStore";
import SimpleHfpLayer from "./SimpleHfpLayer";
import {createRouteKey} from "../../helpers/keys";

@inject(app("state"))
@observer
class MapContent extends Component {
  render() {
    const {
      journeys = [],
      journeyStops,
      timePositions,
      route,
      zoom,
      stopsBbox,
      stop,
      setMapBounds,
      viewLocation,
      setQueryBounds,
      actualQueryBounds,
      centerOnRoute = true,
      state: {selectedJourney, date, mapOverlays, areaEventsStyle},
    } = this.props;

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
                    canCenterOnRoute={centerOnRoute}
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
}

export default MapContent;
