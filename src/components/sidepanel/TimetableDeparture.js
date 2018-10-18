import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import styled from "styled-components";
import BusIcon from "../../icons/Bus";
import TramIcon from "../../icons/Tram";
import RailIcon from "../../icons/Rail";
import getDelayType from "../../helpers/getDelayType";
import withDepartureJourney from "../../hoc/withDepartureJourney";

const transportIcon = {
  BUS: BusIcon,
  TRUNK: BusIcon,
  TRAM: TramIcon,
  RAIL: RailIcon,
};

const transportColor = {
  BUS: "var(--bus-blue)",
  TRUNK: "var(--orange)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
};

const TimetableTime = styled.button`
  margin: 0.25rem;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid var(--lighter-grey);
  background: #fefefe;
  outline: 0;
  width: auto;
  font-family: inherit;
  font-size: 1rem;
  padding: 0;
  cursor: pointer;
`;

const RouteTag = styled.span`
  padding: 3px;
  background-color: transparent;
  color: ${({mode}) => get(transportColor, mode, "var(--light-grey)")};
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  font-weight: bold;
  justify-content: center;
  margin-right: 0.25rem;

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 2px;
    margin-top: -1px;
  }
`;

const TimeDelay = styled.span`
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
  transform: translate(1px, -1px);
  margin-bottom: -2px;

  &:empty {
    display: none;
  }
`;

const TimetableMinutes = styled.span`
  padding: 3px 8px;
  border-left: 1px solid var(--lighter-grey);
`;

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

@withDepartureJourney
@observer
class TimetableDeparture extends Component {
  render() {
    const {departure, journey = null, stop, onClick} = this.props;

    const {
      modes: {nodes: modes},
    } = stop;

    const stopMode = modes[0];

    const dl = get(journey, "dl", null);

    const departureData = {
      ...departure,
      journey,
    };

    const sign = dl < 0 ? "+" : dl > 0 ? "-" : "";
    const seconds = Math.abs(dl) % 60;
    const minutes = Math.floor(Math.abs(dl) / 60);

    return (
      <TimetableTime onClick={onClick(departureData)}>
        <RouteTag mode={stopMode}>
          {React.createElement(get(transportIcon, stopMode, null), {
            fill: get(transportColor, stopMode, "var(--light-grey)"),
            width: "16",
            heigth: "16",
          })}
          {parseLineNumber(departure.routeId)}
        </RouteTag>
        <TimetableMinutes>{doubleDigit(departure.minutes)}</TimetableMinutes>
        {typeof dl === "number" &&
          dl !== null && (
            <TimeDelay delayType={getDelayType(dl)}>
              {sign}
              {doubleDigit(minutes)}:{doubleDigit(seconds)}
            </TimeDelay>
          )}
      </TimetableTime>
    );
  }
}

export default TimetableDeparture;
