import React from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import flow from "lodash/flow";
import styled from "styled-components";
import timingStopIcon from "../../icon-time1.svg";
import {withStop} from "../../hoc/withStop";
import {inject} from "../../helpers/inject";

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

const decorate = flow(
  observer,
  withStop,
  inject("state")
);

export const StopRouteSelect = decorate(({stop, stopLoading, color, onSelectRoute}) => {
  return stopLoading
    ? "loading"
    : get(stop, "routes", []).map((route) => (
        <StopOptionButton
          color={color}
          key={`route_${route.routeId}_${route.direction}`}
          onClick={onSelectRoute(route)}>
          {cleanRouteId(route.routeId)}
          {route.isTimingStop && <TimingIcon src={timingStopIcon} />}
        </StopOptionButton>
      ));
});

export default StopRouteSelect;
