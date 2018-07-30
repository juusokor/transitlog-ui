import React from "react";
import map from "lodash/map";
import moment from "moment";
import {darken} from "polished";

export default ({onTimeClick = () => {}, positions: journeyGroups, queryTime}) => {
  return map(journeyGroups, ({groupName, journeys}) => (
    <div className="hfp-time-row" key={`hfpPos_${groupName}`}>
      <span>{groupName}:</span>{" "}
      {map(journeys, ({arrive, depart}) => {
        if (!arrive) {
          return null;
        }

        const receivedAtMoment = moment(arrive.receivedAt);

        // How far the receivedAt time is from the queried time,
        // divided a bit to fit into the darken() function.
        const diffFromQuery = Math.min(
          Math.abs(queryTime.diff(receivedAtMoment, "seconds")) / 100,
          60 * 5
        );

        const isMatch = diffFromQuery < 3;
        const didntStop = arrive.receivedAt === depart.receivedAt;

        return (
          <button
            onClick={onTimeClick(receivedAtMoment)}
            key={`time_tag_${arrive.receivedAt}_${arrive.uniqueVehicleId}`}
            style={{
              borderColor: didntStop ? "red" : isMatch ? "green" : "transparent",
              color: isMatch ? "#444" : "#fff",
              backgroundColor: darken(
                diffFromQuery / 1000,
                `rgb(0, ${isMatch ? 255 : 200}, ${isMatch ? 150 : 170})`
              ),
            }}
            className="hfp-time-tag">
            {receivedAtMoment.format("HH:mm:ss")}{" "}
          </button>
        );
      })}
    </div>
  ));
};
