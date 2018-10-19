import React from "react";
import map from "lodash/map";
import get from "lodash/get";
import {observer} from "mobx-react";
import {timeToFormat} from "../../helpers/time";
import styled from "styled-components";
import DeparturesQuery from "../../queries/DeparturesQuery";
import getDelayType from "../../helpers/getDelayType";
import moment from "moment-timezone";
import doubleDigit from "../../helpers/doubleDigit";

const TimeRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 0.25rem;
  font-family: var(--font-family);
  font-size: 0.75rem;
`;

const VehicleTag = styled.span`
  width: 6rem;
`;

const TimeTag = styled.button`
  margin: 0.25rem;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid
    ${({didntStop = false}) => (didntStop ? "var(--red)" : "var(--lighter-grey)")};
  background: #fefefe;
  outline: 0;
  width: auto;
  font-family: inherit;
  font-size: 1rem;
  padding: 3px 0;
  cursor: pointer;
`;

const PlannedTime = styled.span`
  padding: 0 5px;
`;

const ObservedTime = styled.span`
  font-size: 0.875rem;
  border-radius: 4px;
  line-height: 1rem;
  padding: 3px 5px;
  display: inline-flex;
  align-items: center;
  background: ${({delayType}) =>
    delayType === "early"
      ? "var(--red)"
      : delayType === "late"
        ? "var(--yellow)"
        : "var(--light-green)"};
  color: ${({delayType}) => (delayType === "late" ? "var(--dark-grey)" : "white")};
  transform: translate(1px, -4px);
  margin-bottom: -8px;

  &:empty {
    display: none;
  }
`;

function findClosestDeparture(departures, adjustedTime) {
  const hour = adjustedTime.hours();
  const minutes = adjustedTime.minutes();
  const departuresForHour = departures.filter((dep) => dep.hours === hour);

  if (departuresForHour.length === 0) {
    return null;
  }

  let closestDeparture = null;

  function diffMinutes(minutes1, minutes2) {
    return Math.abs(minutes1 - minutes2);
  }

  for (const departure of departuresForHour) {
    const diff = diffMinutes(minutes, departure.minutes);
    const prevDiff = closestDeparture
      ? diffMinutes(minutes, closestDeparture.minutes)
      : 60;

    if (diff < prevDiff) {
      closestDeparture = departure;
    }
  }

  return closestDeparture;
}

@observer
class DriveByTimes extends React.Component {
  render() {
    const {
      onTimeClick = () => {},
      positions: journeyGroups,
      date,
      route,
      stop,
      isFirst,
      showTime = "arrive",
    } = this.props;

    return (
      <DeparturesQuery
        date={date}
        route={{
          routeId: get(route, "routeId", ""),
          direction: get(route, "direction", ""),
          // Careful that originstopId doesn't sneak in
        }}
        stop={stop}>
        {({departures}) => {
          return map(journeyGroups, ({vehicleId, journeys}) => (
            <TimeRow key={`hfpPos_${vehicleId}`}>
              <VehicleTag>{vehicleId}:</VehicleTag>{" "}
              {map(journeys, ({arrive, depart}) => {
                if (!arrive) {
                  return null;
                }

                const useTime = showTime === "arrive" ? arrive : depart;
                const receivedAtDate = moment.tz(
                  useTime.received_at,
                  "Europe/Helsinki"
                );

                // If arrive and depart are the same, it means the stop times algorithm
                // didn't find an open door at this stop and it's safe to say that
                // the vehicle didn't stop here.
                const didntStop =
                  arrive.received_at === depart.received_at && !depart.drst;

                // For the first stop, it's the departure time that counts.
                const delayType = getDelayType(isFirst ? depart.dl : arrive.dl);

                const plannedTime = moment.tz(
                  isFirst ? depart.received_at : arrive.received_at,
                  "Europe/Helsinki"
                );

                const delayRounded = Math.round(arrive.dl / 10) * 10;

                if (delayRounded > 0) {
                  plannedTime.add(delayRounded, "seconds");
                } else if (delayRounded < 0) {
                  plannedTime.subtract(Math.abs(delayRounded), "seconds");
                }

                // Find the closest planned departure
                const closestDeparture = findClosestDeparture(
                  departures,
                  plannedTime
                );

                // Show a planned departure time. Fall back to calculated time if
                // closest is null.
                const plannedDepartureTime = closestDeparture
                  ? `${doubleDigit(closestDeparture.hours)}:${doubleDigit(
                      closestDeparture.minutes
                    )}`
                  : plannedTime.format("HH:mm");

                return (
                  <TimeTag
                    onClick={onTimeClick(
                      timeToFormat(receivedAtDate, "HH:mm:ss", "Europe/Helsinki")
                    )}
                    key={`time_tag_${useTime.received_at}_${
                      useTime.unique_vehicle_id
                    }`}
                    didntStop={didntStop}>
                    <PlannedTime>{plannedDepartureTime}</PlannedTime>
                    <ObservedTime delayType={delayType}>
                      {receivedAtDate.format("HH:mm:ss")}
                    </ObservedTime>
                  </TimeTag>
                );
              })}
            </TimeRow>
          ));
        }}
      </DeparturesQuery>
    );
  }
}

export default DriveByTimes;
