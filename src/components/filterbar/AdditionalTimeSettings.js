import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {text} from "../../helpers/text";
import {ControlGroup} from "../Forms";
import styled from "styled-components";
import Input from "../Input";

const SettingsWrapper = styled.div`
  padding-top: 0.5rem;
`;

const IncrementValueInput = styled(Input)`
  flex: 0 1 50%;
`;

@inject(app("Time"))
@observer
class AdditionalTimeSettings extends Component {
  render() {
    const {state, Time} = this.props;
    const {timeIncrement, areaSearchRangeMinutes} = state;

    return (
      <SettingsWrapper>
        <ControlGroup>
          <IncrementValueInput
            label={text("filterpanel.time_increment")}
            type="number"
            max={1000}
            maxLength={4}
            value={timeIncrement}
            onChange={(e) => Time.setTimeIncrement(e.target.value)}
          />
        </ControlGroup>
        <ControlGroup>
          <IncrementValueInput
            label="Area search minutes range"
            type="number"
            max={60 * 12}
            min={5}
            maxLength={2}
            value={areaSearchRangeMinutes}
            onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
          />
          <input
            type="range"
            max={60 * 12}
            min={5}
            value={areaSearchRangeMinutes}
            onChange={(e) => Time.setAreaSearchMinutes(e.target.value)}
          />
        </ControlGroup>
      </SettingsWrapper>
    );
  }
}

export default AdditionalTimeSettings;
