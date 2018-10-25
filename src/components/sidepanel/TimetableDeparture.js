import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import doubleDigit from "../../helpers/doubleDigit";
import styled from "styled-components";
import BusIcon from "../../icons/Bus";
import TramIcon from "../../icons/Tram";
import RailIcon from "../../icons/Rail";
import getDelayType from "../../helpers/getDelayType";
import DepartureJourneyQuery from "../../queries/DepartureJourneyQuery";
import {combineDateAndTime} from "../../helpers/time";
import moment from "moment-timezone";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";

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
  margin: 0.3rem 0.25rem;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: 4px;
  border: 1px solid var(--lighter-grey);
  background: #fefefe;
  outline: 0;
  width: 100%;
  font-family: inherit;
  font-size: 1rem;
  padding: 0;
  cursor: pointer;
`;

const ColoredIconSlot = styled.span`
  padding: 3px 3px 3px 5px;
  background-color: transparent;
  color: ${({mode}) => get(transportColor, mode, "var(--light-grey)")};
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  font-weight: bold;
  justify-content: flex-start;
  margin-right: 0.25rem;
  min-width: 5rem;

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 2px;
    margin-top: -1px;
  }
`;

const ColoredBackgroundSlot = styled.span`
  font-size: 0.875rem;
  border-radius: 4px;
  line-height: 1rem;
  padding: 3px 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({delayType}) =>
    delayType === "early"
      ? "var(--red)"
      : delayType === "late"
        ? "var(--yellow)"
        : "var(--light-green)"};
  color: ${({delayType}) => (delayType === "late" ? "var(--dark-grey)" : "white")};
  transform: translate(1px, -1px);
  margin-bottom: -2px;
  min-width: 5rem;

  &:empty {
    display: none;
  }
`;

const PlainSlot = styled.span`
  min-width: 4rem;
  padding: 3px 8px;
  border-left: 1px solid var(--lighter-grey);
  font-weight: bold;
`;

const PlainSlotSmallRight = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  border-left: 0;
  font-weight: normal;
  min-width: 4rem;
  padding: 3px 8px;
  font-size: 0.875rem;
`;

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

@observer
class TimetableDeparture extends Component {
  render() {
    const {departure, date, stop, onClick} = this.props;

    const {
      modes: {nodes: modes},
    } = stop;

    const stopMode = modes[0];

    return (
      <DepartureJourneyQuery date={date} departure={departure}>
        {({journey}) => {
          const departureData = {
            ...departure,
            journey,
          };

          const plannedObservedDiff = diffDepartureJourney(journey, departure, date);

          return (
            <TimetableTime onClick={onClick(departureData)}>
              <ColoredIconSlot mode={stopMode}>
                {React.createElement(get(transportIcon, stopMode, null), {
                  fill: get(transportColor, stopMode, "var(--light-grey)"),
                  width: "16",
                  heigth: "16",
                })}
                {parseLineNumber(departure.routeId)}
              </ColoredIconSlot>
              <PlainSlot>{doubleDigit(departure.minutes)}</PlainSlot>
              {plannedObservedDiff && (
                <>
                  <ColoredBackgroundSlot
                    delayType={getDelayType(plannedObservedDiff.diff)}>
                    {plannedObservedDiff.sign}
                    {doubleDigit(plannedObservedDiff.minutes)}:
                    {doubleDigit(plannedObservedDiff.seconds)}
                  </ColoredBackgroundSlot>
                  <PlainSlotSmallRight>
                    {plannedObservedDiff.observedMoment.format("HH:mm:ss")}
                  </PlainSlotSmallRight>
                </>
              )}
            </TimetableTime>
          );
        }}
      </DepartureJourneyQuery>
    );
  }
}

export default TimetableDeparture;
