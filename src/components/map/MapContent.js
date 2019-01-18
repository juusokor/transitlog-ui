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
      positions = [],
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
            {positions.length !== 0 &&
              positions.map(({journeyId, events}) =>
                areaEventsStyle === areaEventsStyles.MARKERS ? (
                  <HfpMarkerLayer
                    key={`hfp_markers_${journeyId}`}
                    onMarkerClick={this.onClickVehicleMarker}
                    positions={events}
                    journeyId={journeyId}
                    maxTimeDiff={3}
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
                positions.length === 0)) && (
              <RouteStopsLayer
                showRadius={showStopRadius}
                onViewLocation={viewLocation}
                route={route}
                positions={[]}
              />
            )}
            {positions.length > 0 &&
              positions.map(({events: journeyPositions, journeyId}) => {
                if (
                  vehicle &&
                  get(journeyPositions, "[0].unique_vehicle_id", "") !== vehicle
                ) {
                  return null;
                }

                const isSelectedJourney =
                  selectedJourney && getJourneyId(selectedJourney) === journeyId;

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
                    positions={journeyPositions}
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
