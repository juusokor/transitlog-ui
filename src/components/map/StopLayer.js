import React, {useRef, useEffect} from "react";
import {observer} from "mobx-react-lite";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";
import {inject} from "../../helpers/inject";
import {flow} from "lodash";

const decorate = flow(
  observer,
  inject("state")
);

const StopLayer = decorate(({bounds, date, onViewLocation, showRadius, state}) => {
  const prevStopMarkerRef = useRef(null);
  const stopMarkerRef = useRef(null);
  const {stop: selectedStop} = state;

  useEffect(() => {
    if (stopMarkerRef.current && selectedStop) {
      if (prevStopMarkerRef.current) {
        prevStopMarkerRef.current.wrappedInstance.togglePopup(false);
      }

      stopMarkerRef.current.wrappedInstance.togglePopup(true);
      prevStopMarkerRef.current = stopMarkerRef.current;
    } else if (prevStopMarkerRef.current) {
      prevStopMarkerRef.current.wrappedInstance.togglePopup(false);
    }
  }, [stopMarkerRef.current, selectedStop]);

  const bbox = bounds
    ? {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      }
    : {};

  return (
    <StopsByBboxQuery skip={!bounds} variables={{...bbox, date}}>
      {({stops}) => {
        const stopAreas = stops.reduce((groups, stop) => {
          const pos = latLng(stop.lat, stop.lon);
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
              ref={clusterIsSelected ? stopMarkerRef : null}
              showRadius={showRadius}
              onViewLocation={onViewLocation}
              key={`stops_${stopCluster[0].stopId}`}
              stop={stopCluster[0]}
            />
          ) : (
            <CompoundStopMarker
              ref={clusterIsSelected ? stopMarkerRef : null}
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
