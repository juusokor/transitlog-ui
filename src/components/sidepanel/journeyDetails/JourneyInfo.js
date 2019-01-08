import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import Equipment from "./Equipment";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../../helpers/doubleDigit";
import {getEquipmentType, getFeature} from "./equipmentType";

const JourneyInfo = styled.div`
  flex: none;
`;

const JourneyInfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2rem;
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

  span:first-child {
    color: var(--grey);
  }
`;

export default ({journey, departure, date, originStopTimes}) => {
  const equipment = <Equipment journey={journey} departure={departure} />;
  const equipmentType = getEquipmentType(departure.equipmentType);

  return (
    <JourneyInfo>
      {originStopTimes && (
        <>
          <JourneyInfoRow>
            <Line>
              <span>Terminal time</span>
              <span>{get(originStopTimes.departure, "terminalTime", 3)} min</span>
            </Line>
            <Line right>
              <CalculateTerminalTime
                date={date}
                departure={originStopTimes.departure}
                event={originStopTimes.arrivalEvent}>
                {({diffMinutes, diffSeconds, wasLate}) => (
                  <strong style={{color: wasLate ? "var(--red)" : "inherit"}}>
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </strong>
                )}
              </CalculateTerminalTime>
            </Line>
          </JourneyInfoRow>
          <JourneyInfoRow>
            <Line>
              <span>Recovery time</span>
              <span>{get(originStopTimes.departure, "recoveryTime", 3)} min</span>
            </Line>
          </JourneyInfoRow>
        </>
      )}
      <JourneyInfoRow>
        <Line>
          <span>
            Equipment {departure.equipmentRequired ? "required" : "planned"}
          </span>
          <span>
            {equipmentType ? (
              <>
                {equipmentType} ({getFeature(equipmentType)})
              </>
            ) : (
              "No data"
            )}
          </span>
        </Line>
        {equipment && <Line right>{equipment}</Line>}
      </JourneyInfoRow>
    </JourneyInfo>
  );
};
