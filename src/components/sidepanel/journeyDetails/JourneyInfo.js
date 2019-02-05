import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import Equipment from "./Equipment";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../../helpers/doubleDigit";
import {getEquipmentType} from "./equipmentType";
import {Text, text} from "../../../helpers/text";
import {getOperatorName} from "../../../helpers/getOperatorNameById";

const JourneyInfo = styled.div`
  flex: none;
`;

const JourneyInfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 1rem;
  background: var(--lightest-grey);
  font-size: 1rem;
  font-family: inherit;

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.0075);
  }
`;

const Line = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  line-height: 1.5;
  justify-content: ${({right = false}) => (right ? "flex-end" : "space-between")};
  font-size: ${({small = false}) => (small ? "0.75rem" : "0.95rem")};
  color: var(--dark-grey);
`;

const LineHeading = styled.span`
  color: var(--light-grey);
  font-size: 1rem;
`;

const Values = styled.div`
  font-size: ${({small = false}) => (small ? "0.75rem" : "0.95rem")};
  color: var(--dark-grey);
  margin-left: auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  > *:last-child:not(:first-child) {
    &:before {
      content: "";
      display: inline-block;
      height: 2rem;
      width: 1px;
      margin: -0.5rem 0.75rem -0.4rem 0.75rem;
      background-color: #cccccc;
      transform: rotate(20deg);
      vertical-align: middle;
    }
  }
`;

export default ({
  journey,
  departure,
  date,
  originStopTimes,
  destinationStopTimes,
}) => {
  if (!departure) {
    return null;
  }

  const equipment = <Equipment journey={journey} departure={departure} />;
  const equipmentCode = get(departure, "equipmentType", "");
  const equipmentType = getEquipmentType(equipmentCode);
  const operatorName = getOperatorName(departure.operatorId);
  const observedOperatorName = getOperatorName(journey.owner_operator_id);

  console.log(operatorName, observedOperatorName);

  return (
    <JourneyInfo>
      <JourneyInfoRow>
        <Line>
          <LineHeading>Operator</LineHeading>
          <Values small>
            <span>{operatorName}</span>
          </Values>
        </Line>
        {observedOperatorName !== operatorName && (
          <Line small right>
            {observedOperatorName}
          </Line>
        )}
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>journey.terminal_time</Text>
          </LineHeading>
          <Values>
            <span>{get(departure, "terminalTime", 0)} min</span>
            {originStopTimes && (
              <CalculateTerminalTime
                date={date}
                departure={originStopTimes.departure}
                event={originStopTimes.arrivalEvent}>
                {({diffMinutes, diffSeconds, sign, wasLate}) => (
                  <strong style={{color: wasLate ? "var(--red)" : "inherit"}}>
                    {sign === "-" ? "-" : ""}
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </strong>
                )}
              </CalculateTerminalTime>
            )}
          </Values>
        </Line>
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>journey.recovery_time</Text>
          </LineHeading>
          <Values>
            <span>{get(departure, "recoveryTime", 0)} min</span>
            {destinationStopTimes && (
              <CalculateTerminalTime
                recovery={true}
                date={date}
                departure={destinationStopTimes.departure}
                event={destinationStopTimes.arrivalEvent}>
                {({diffMinutes, diffSeconds, wasLate, sign}) => (
                  <strong style={{color: wasLate ? "var(--red)" : "inherit"}}>
                    {sign === "-" ? "-" : ""}
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </strong>
                )}
              </CalculateTerminalTime>
            )}
          </Values>
        </Line>
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <LineHeading>
            <Text>journey.requested_equipment</Text>
          </LineHeading>
          <Values>
            <span>
              {equipmentType
                ? equipmentType
                : equipmentCode
                ? equipmentCode
                : text("general.no_type")}
              {get(departure, "trunkColorRequired", 0) === 1 && <>, HSL-orans</>}
            </span>
            {equipment && <span>{equipment}</span>}
          </Values>
        </Line>
      </JourneyInfoRow>
    </JourneyInfo>
  );
};
