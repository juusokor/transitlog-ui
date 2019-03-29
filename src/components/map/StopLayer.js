import React from "react";
import {observer} from "mobx-react-lite";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("state")
);

const StopLayer = decorate(({bounds, date, onViewLocation, showRadius, state}) => {
  const {stop: selectedStop} = state;

  const bbox =
    bounds && typeof bounds.toBBoxString === "function"
      ? bounds.toBBoxString()
      : typeof bounds === "string"
      ? bounds
      : "";

  return (
    <StopsByBboxQuery skip={!bbox} bbox={bbox}>
      {({stops}) => {
        const stopAreas = stops.reduce((groups, stop) => {
          const pos = latLng(stop.lat, stop.lng);
          let groupBounds;

          if (groups.size !== 0) {
            const groupEntries = groups.entries();
            for (const [area] of groupEntries) {
              if (area.contains(pos)) {
                groupBounds = area;
                break;
              }
            }
          }

          if (!groupBounds) {
            groupBounds = pos.toBounds(3);
          }

          const stopGroup = groups.get(groupBounds) || [];
          stopGroup.push(stop);

          return groups.set(groupBounds, stopGroup);
        }, new Map());

        return Array.from(stopAreas.entries()).map(([bounds, stopCluster]) => {
          const clusterIsSelected = stopCluster.some(
            ({stopId}) => stopId === selectedStop
          );

          return stopCluster.length === 1 ? (
            <StopMarker
              popupOpen={clusterIsSelected}
              showRadius={showRadius}
              onViewLocation={onViewLocation}
              key={`stops_${stopCluster[0].stopId}`}
              stop={stopCluster[0]}
            />
          ) : (
            <CompoundStopMarker
              popupOpen={clusterIsSelected}
              bounds={bounds}
              showRadius={showRadius}
              onViewLocation={onViewLocation}
              key={`stopcluster_${bounds.toBBoxString()}`}
              stops={stopCluster}
            />
          );
        });
      }}
    </StopsByBboxQuery>
  );
});

export default StopLayer;
