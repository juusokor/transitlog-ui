import React, {Component} from "react";
import {observer} from "mobx-react";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import CompoundStopMarker from "./CompoundStopMarker";

@observer
class StopLayer extends Component {
  render() {
    const {bounds, date, onViewLocation, showRadius} = this.props;

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
            let bounds;

            if (groups.size !== 0) {
              const groupEntries = groups.entries();
              for (const [area] of groupEntries) {
                if (area.contains(pos)) {
                  bounds = area;
                  break;
                }
              }
            }

            if (!bounds) {
              bounds = pos.toBounds(40);
            }

            const stopGroup = groups.get(bounds) || [];
            stopGroup.push(stop);

            return groups.set(bounds, stopGroup);
          }, new Map());

          return Array.from(stopAreas.entries()).map(([bounds, stopCluster]) =>
            stopCluster.length === 1 ? (
              <StopMarker
                showRadius={showRadius}
                onViewLocation={onViewLocation}
                key={`stops_${stopCluster[0].stopId}`}
                stop={stopCluster[0]}
              />
            ) : (
              <CompoundStopMarker
                bounds={bounds}
                showRadius={showRadius}
                onViewLocation={onViewLocation}
                key={`stopcluster_${bounds.toBBoxString()}`}
                stops={stopCluster}
              />
            )
          );
        }}
      </StopsByBboxQuery>
    );
  }
}

export default StopLayer;
