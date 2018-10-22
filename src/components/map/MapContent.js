import React, {Component} from "react";
import {observer, Observer, inject} from "mobx-react";
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

@inject(app("state"))
@observer
class MapContent extends Component {
  render() {
    const {
      positions,
      route,
      zoom,
      stopsBbox,
      stop,
      setMapBounds,
      state: {vehicle, selectedJourney, date},
    } = this.props;

    return (
      <>
        {(!route || !route.routeId) && zoom > 14 ? (
          <StopLayer date={date} bounds={stopsBbox} />
        ) : stop ? (
          <StopMarker stop={stop} selected={true} date={date} />
        ) : null}
        {route &&
          route.routeId && (
            <RouteQuery
              key={`route_query_${createRouteIdentifier(route)}`}
              route={route}>
              {({routeGeometry, stops}) =>
                routeGeometry.length !== 0 ? (
                  <RouteLayer
                    key="routeLayer"
                    routeGeometry={routeGeometry}
                    stops={stops}
                    setMapBounds={setMapBounds}
                    key={`route_line_${route.routeId}`}
                    positions={positions}
                  />
                ) : null
              }
            </RouteQuery>
          )}
        {positions.length > 0 &&
          positions.map(({positions, journeyId}) => {
            if (vehicle && get(positions, "[0].unique_vehicle_id", "") !== vehicle) {
              return null;
            }

            const isSelectedJourney =
              selectedJourney && getJourneyId(selectedJourney) === journeyId;

            return [
              isSelectedJourney ? (
                <HfpLayer
                  key={`hfp_line_${journeyId}`}
                  selectedJourney={selectedJourney}
                  positions={positions}
                  name={journeyId}
                />
              ) : null,
              <HfpMarkerLayer
                key={`hfp_markers_${journeyId}`}
                onMarkerClick={this.onClickVehicleMarker}
                positions={positions}
                name={journeyId}
              />,
            ];
          })}
      </>
    );
  }
}

export default MapContent;
