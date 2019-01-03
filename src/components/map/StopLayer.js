import React, {Component} from "react";
import {observer} from "mobx-react";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {latLng} from "leaflet";
import groupBy from "lodash/groupBy";
import CompoundStopMarker from "./CompoundStopMarker";

@observer
class StopLayer extends Component {
  render() {
    const {bounds, date, onViewLocation, showRadius} = this.props;

    const bbox = {
      minLat: bounds.getSouth(),
      minLon: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLon: bounds.getEast(),
    };

    return (
      <StopsByBboxQuery variables={{...bbox, date}}>
        {({stops}) => {
          const stopClusters = groupBy(stops, (stop) => {
            return latLng(stop.lat, stop.lon)
              .toBounds(20)
              .toBBoxString();
          });

          return Object.entries(stopClusters).map(([bboxString, stopCluster]) =>
            stopCluster.length === 1 ? (
              <StopMarker
                showRadius={showRadius}
                onViewLocation={onViewLocation}
                key={`stops_${stopCluster[0].stopId}`}
                stop={stopCluster[0]}
              />
            ) : (
              <CompoundStopMarker
                bboxString={bboxString}
                showRadius={showRadius}
                onViewLocation={onViewLocation}
                key={`stopcluster_${bboxString}`}
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
