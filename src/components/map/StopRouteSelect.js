import React from "react";
import SingleStopQuery from "../../queries/SingleStopQuery";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import styled from "styled-components";
import timingStopIcon from "../../icon-time1.svg";

const StopOptionButton = styled.button`
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: var(--lightest-grey);
  margin: 0 0 0.5rem 0;
  display: block;
  border: ${({color = "var(--lightest-grey)"}) =>
    color ? `3px solid ${color}` : "3px solid var(--lightest-grey)"};
  cursor: pointer;

  &:hover {
    background-color: var(--lighter-grey);
  }
`;

const TimingIcon = styled.img`
  width: 0.95rem;
  height: 0.95rem;
  display: block;
  margin-left: auto;
  margin-bottom: 0;
`;

function cleanRouteId(routeId) {
  return routeId.substring(1).replace(/^0+/, "");
}

export const StopRouteSelect = observer(({stopId, date, color, onSelectRoute}) => {
  return (
    <SingleStopQuery stopId={stopId} date={date}>
      {({stop, loading}) => (
        <>
          {loading
            ? "loading"
            : get(stop, "routes", []).map((route) => (
                <StopOptionButton
                  color={color}
                  key={`route_${route.routeId}_${route.direction}`}
                  onClick={onSelectRoute}>
                  {cleanRouteId(route.routeId)}
                  {route.isTimingStop && <TimingIcon src={timingStopIcon} />}
                </StopOptionButton>
              ))}
        </>
      )}
    </SingleStopQuery>
  );
});

export default StopRouteSelect;
