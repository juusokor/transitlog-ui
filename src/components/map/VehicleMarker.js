import React from "react";
import get from "lodash/get";
import styled from "styled-components";
import {getModeColor} from "../../helpers/vehicleColor";

const IconWrapper = styled.span`
  width: 100%;
  height: 100%;
  display: block;
  padding: 3px;
  border-radius: 50%;
  position: relative;
  background-color: ${({color}) => color};
`;

const Icon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  z-index: 10;
  transform: ${({rotation}) => `rotate(${rotation}deg)`};
  background-color: ${({color}) => color};

  &:before {
    content: " ";
    width: 100%;
    height: 100%;
    margin: 0;
    display: block;
    transform: scale(0.925, 0.925);
  }
`;

const Indicator = styled.span`
  position: absolute;
  z-index: 10;
  bottom: calc(50% - 6px);
  right: ${({position = "right"}) => (position === "right" ? "-7px" : "auto")};
  left: ${({position = "left"}) => (position === "left" ? "-7px" : "auto")};
  background: ${({color = "var(--dark-blue)"}) => color};
  border: 2px solid white;
  width: 10px;
  height: 10px;
  border-radius: 50%;
`;

const RotationWrapper = styled.span.attrs(({rotation}) => ({
  style: {
    transform: `rotate(${rotation}deg)`,
  },
}))`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform-origin: center;
  z-index: 1;
`;

const HeadingArrow = styled.span`
  width: 0;
  height: 0;
  position: absolute;
  top: ${({small}) => (small ? "-14px" : "-29px")};
  left: ${({small}) => (small ? "2px" : "5px")};
  border-width: ${({small}) => (small ? "9px 8px" : "17px 13px")};
  border-color: transparent transparent ${({color = "var(--blue)"}) => color} transparent;
  border-style: solid;
  z-index: 0;
`;

class VehicleMarker extends React.Component {
  render() {
    const {position, isSelectedJourney = false} = this.props;

    const color = getModeColor(get(position, "mode", "").toUpperCase());

    // The spd value can be a bit flaky, so I decided that under 2 m/s is stopped enough.
    const isStopped = position.spd < 2;

    // TODO: Highlight non-selected journeys

    return (
      <IconWrapper
        translucent={!isSelectedJourney}
        color={color}
        isStopped={isStopped}
        data-testid="hfp-marker-icon">
        <Icon
          color={color}
          data-testid="icon-icon"
          // The mode className applies the vehicle icon
          className={get(position, "mode", "BUS").toUpperCase()}
        />
        <RotationWrapper
          color={color}
          rotation={get(position, "hdg", 0)}
          data-testid="icon-rotation">
          {position.drst && <Indicator position="right" color="var(--dark-blue)" />}
          {position.full && <Indicator position="left" color="var(--red)" />}
          {!isStopped && (
            <HeadingArrow
              small={!isSelectedJourney}
              className="hfp-marker-heading"
              color={color}
            />
          )}
        </RotationWrapper>
      </IconWrapper>
    );
  }
}

export default VehicleMarker;
