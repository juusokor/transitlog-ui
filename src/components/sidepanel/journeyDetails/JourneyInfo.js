import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import Equipment from "./Equipment";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../../helpers/doubleDigit";
import {getEquipmentType} from "./equipmentType";
import {Text, text} from "../../../helpers/text";
import {getTimeString} from "../../../helpers/time";

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
  color: var(--dark-grey);

  > span:first-child {
    color: var(--grey);
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

  return (
    <JourneyInfo>
      <JourneyInfoRow>
        <Line>
          <span>
            <Text>journey.terminal_time</Text>
          </span>
          <span>{get(departure, "terminalTime", 0)} min</span>
        </Line>
        {originStopTimes && (
          <Line right>
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
          </Line>
        )}
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <span>
            <Text>journey.recovery_time</Text>
          </span>
          <span>{get(departure, "recoveryTime", 0)} min</span>
        </Line>
        {destinationStopTimes && (
          <Line right>
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
          </Line>
        )}
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <span>
            <Text>journey.requested_equipment</Text>
          </span>
          <span>
            {equipmentType
              ? equipmentType
              : equipmentCode
              ? equipmentCode
              : text("general.no_type")}
            {get(departure, "trunkColorRequired", 0) === 1 && <>, HSL-orans</>}
          </span>
        </Line>
        {equipment && <Line right>{equipment}</Line>}
      </JourneyInfoRow>
    </JourneyInfo>
  );
};
