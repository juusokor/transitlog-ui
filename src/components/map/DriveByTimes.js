import React from "react";
import map from "lodash/map";
import parse from "date-fns/parse";
import format from "date-fns/format";
import diffSeconds from "date-fns/difference_in_seconds";
import {darken} from "polished";
import {observer} from "mobx-react";
import {timeToFormat} from "../../helpers/time";

@observer
class DriveByTimes extends React.Component {
  render() {
    const {
      onTimeClick = () => {},
      positions: journeyGroups,
      queryTime,
      showTime = "arrive",
    } = this.props;

    return map(journeyGroups, ({vehicleId, journeys}) => (
      <div className="hfp-time-row" key={`hfpPos_${vehicleId}`}>
        <span>{vehicleId}:</span>{" "}
        {map(journeys, ({arrive, depart}) => {
          if (!arrive) {
            return null;
          }

          const useTime = showTime === "arrive" ? arrive : depart;
          const receivedAtDate = parse(useTime.received_at);

          // How far the received_at time is from the queried time,
          // divided a bit to fit into the darken() function.
          const diffFromQuery = Math.min(
            Math.abs(diffSeconds(queryTime, receivedAtDate, "seconds")) / 100,
            60 * 5
          );

          const isMatch = diffFromQuery < 3;
          // If arrive and depart are the same, it means the stop times algorithm
          // didn't find an open door at this stop and it's safe to say that
          // the vehicle didn't stop here.
          const didntStop =
            arrive.received_at === depart.received_at && !depart.drst;

          return (
            <button
              onClick={onTimeClick(
                timeToFormat(receivedAtDate, "HH:mm:ss", "Europe/Helsinki")
              )}
              key={`time_tag_${useTime.received_at}_${useTime.unique_vehicle_id}`}
              style={{
                borderColor: didntStop ? "red" : isMatch ? "green" : "transparent",
                color: isMatch ? "#444" : "#fff",
                backgroundColor: darken(
                  diffFromQuery / 1000,
                  `rgb(0, ${isMatch ? 255 : 200}, ${isMatch ? 150 : 170})`
                ),
              }}
              className="hfp-time-tag">
              {timeToFormat(receivedAtDate, "HH:mm:ss", "Europe/Helsinki")}{" "}
            </button>
          );
        })}
      </div>
    ));
  }
}

export default DriveByTimes;
