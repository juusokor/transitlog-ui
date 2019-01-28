import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import StopLayer from "./StopLayer";
import StopMarker from "./StopMarker";
import RouteQuery from "../../queries/RouteQuery";
import createRouteIdentifier from "../../helpers/createRouteIdentifier";
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

@inject(app("Journey", "Filters"))
@observer
class MapContent extends Component {
  onClickVehicleMarker = (journey) => {
    const {Journey, Filters, state} = this.props;

    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Filters.setVehicle(journey.unique_vehicle_id);
      Journey.setSelectedJourney(journey);
    }
  };

  render() {
    const {
      journeys = [],
      timePositions = new Map(),
      route,
      zoom,
      stopsBbox,
      stop,
      setMapBounds,
      viewLocation,
      queryBounds,
      state: {vehicle, selectedJourney, date, mapOverlays, areaEventsStyle},
    } = this.props;

    const hasRoute = !!route && !!route.routeId;
    const showStopRadius = expr(() => mapOverlays.indexOf("Stop radius") !== -1);

    return (
      <>
        <HfpMarkerLayer
          key={`hfp_marker_test`}
          onMarkerClick={this.onClickVehicleMarker}
          currentPosition={{
            lat: 60.170988,
            long: 24.940842,
            mode: "BUS",
            hdg: 30,
            drst: true,
          }}
          journeyId="test"
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
                selected={true}
                date={date}
              />
            ) : null}
            <AreaSelect enabled={zoom > 14} onSelectArea={queryBounds} />
            {journeys.length !== 0 &&
              journeys.map(({journeyId, events}) =>
                areaEventsStyle === areaEventsStyles.MARKERS ? (
                  <HfpMarkerLayer
                    key={`hfp_markers_${journeyId}`}
                    onMarkerClick={this.onClickVehicleMarker}
                    currentPosition={timePositions.get(journeyId)}
                    journeyId={journeyId}
                  />
                ) : (
                  <SimpleHfpLayer
                    zoom={zoom}
                    name={journeyId}
                    key={`hfp_polyline_${journeyId}`}
                    positions={events}
                  />
                )
              )}
          </>
        )}
        {/* When a route IS selected... */}
        {hasRoute && (
          <>
            <RouteQuery
              key={`route_query_${createRouteIdentifier(route)}`}
              route={route}>
              {({routeGeometry}) =>
                routeGeometry.length !== 0 ? (
                  <RouteLayer
                    routeId={
                      routeGeometry.length !== 0
                        ? createRouteIdentifier(route)
                        : null
                    }
                    routeGeometry={routeGeometry}
                    setMapBounds={setMapBounds}
                    key={`route_line_${createRouteIdentifier(route)}`}
                  />
                ) : null
              }
            </RouteQuery>
            {(!selectedJourney ||
              (selectedJourney.route_id !== route.routeId ||
                journeys.length === 0)) && (
              <RouteStopsLayer
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                route={route}
                positions={[]}
              />
            )}

            {journeys.length !== 0 &&
              journeys.map(({events: journeyPositions, journeyId}) => {
                if (
                  vehicle &&
                  get(journeyPositions, "[0].unique_vehicle_id", "") !== vehicle
                ) {
                  return null;
                }

                const isSelectedJourney =
                  selectedJourney && getJourneyId(selectedJourney) === journeyId;

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
                      positions={journeyPositions}
                    />
                  ) : null,
                  <HfpMarkerLayer
                    key={`hfp_markers_${journeyId}`}
                    onMarkerClick={this.onClickVehicleMarker}
                    currentPosition={currentPosition}
                    journeyId={journeyId}
                  />,
                ];
              })}
          </>
        )}
      </>
    );
  }
}

export default MapContent;
