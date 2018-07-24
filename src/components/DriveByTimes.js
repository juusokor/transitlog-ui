import React from "react";
import map from "lodash/map";
import moment from "moment";
import {darken} from "polished";
import "./Popup.css";

export default ({onTimeClick = () => {}, positions: positionGroups, queryTime}) => {
  return map(positionGroups, ({positions, groupName}) => {
    return positions.length ? (
      <div className="hfp-time-row" key={`hfpPos_${groupName}`}>
        <span>{groupName}:</span>{" "}
        {map(positions, (position) => {
          const receivedAtMoment = moment(position.receivedAt);

          // How far the receivedAt time is from the queried time,
          // divided a bit to fit into the darken() function.
          const diffFromQuery = Math.min(
            Math.abs(queryTime.diff(receivedAtMoment, "seconds")) / 100,
            60 * 5
          );

          const isMatch = diffFromQuery < 3;

          return (
            <a
              href="#"
              onClick={onTimeClick(receivedAtMoment)}
              key={`time_tag_${position.receivedAt}_${position.uniqueVehivleId}`}
              style={{
                borderColor: isMatch ? "green" : "transparent",
                color: isMatch ? "#444" : "#fff",
                backgroundColor: darken(
                  diffFromQuery / 1000,
                  `rgb(0, ${isMatch ? 255 : 200}, ${isMatch ? 150 : 170})`
                ),
              }}
              className="hfp-time-tag">
              {receivedAtMoment.format("HH:mm:ss")}{" "}
            </a>
          );
        })}
      </div>
    ) : null;
  });
};
