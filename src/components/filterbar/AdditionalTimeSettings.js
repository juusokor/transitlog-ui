import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {text} from "../../helpers/text";
import {Button, ControlGroup} from "../Forms";
import styled from "styled-components";
import Input from "../Input";

const IncrementValueInput = styled(Input)`
  flex: 0 1 50%;
`;

@inject(app("Time"))
@observer
class AdditionalTimeSettings extends Component {
  render() {
    const {state, Time} = this.props;
    const {timeIncrement, playing, areaSearchRangeMinutes} = state;

    return (
      <>
        <ControlGroup>
          <IncrementValueInput
            label={text("filterpanel.time_increment")}
            type="number"
            max={1000}
            maxLength={4}
            value={timeIncrement}
            onChange={(e) => Time.setTimeIncrement(e.target.value)}
          />
          <Button small onClick={Time.toggleAutoplay}>
            {playing
              ? text("filterpanel.simulate.stop")
              : text("filterpanel.simulate.start")}
          </Button>
        </ControlGroup>
        <ControlGroup>
          <IncrementValueInput
            label="Area search minutes range"
            type="number"
            max={20}
            min={2}
            maxLength={2}
            value={areaSearchRangeMinutes}
            onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
          />
        </ControlGroup>
      </>
    );
  }
}

export default AdditionalTimeSettings;
