import React, {Component} from "react";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import {Button} from "../Forms";
import {observer} from "mobx-react";
import ToggleButton from "../ToggleButton";

const Bar = styled.div`
  padding: 0.5rem 1rem;
  background: var(--lightest-grey);
  border-bottom: 1px solid var(--alt-grey);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ControlButton = styled(Button).attrs({small: true})`
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
`;

const PollToggle = styled(ToggleButton)`
  flex: 0;
`;

@observer
class ControlBar extends Component {
  render() {
    const {
      pollingEnabled,
      onTogglePolling,
      onResetClick,
      onUpdateClick,
    } = this.props;

    return (
      <Bar>
        <ControlButton onClick={onResetClick}>
          <Text>filterpanel.reset</Text>
        </ControlButton>
        <ControlButton onClick={onUpdateClick}>
          <Text>general.update</Text>
        </ControlButton>
        <PollToggle
          type="checkbox"
          onChange={() => onTogglePolling()}
          name="query_polling"
          label={text("general.live")}
          checked={pollingEnabled}
          value="enabled"
        />
      </Bar>
    );
  }
}

export default ControlBar;
