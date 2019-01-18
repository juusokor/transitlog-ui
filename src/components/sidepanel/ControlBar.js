import React, {Component} from "react";
import styled from "styled-components";
import {Text, text} from "../../helpers/text";
import {Button} from "../Forms";
import {observer, inject} from "mobx-react";
import ToggleButton from "../ToggleButton";
import {app} from "mobx-app";

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

@inject(app("Filters", "Update", "UI"))
@observer
class ControlBar extends Component {
  onClickReset = () => this.props.Filters.reset();
  onClickUpdate = () => this.props.Update.update();
  onToggleLive = () => this.props.UI.togglePolling();

  render() {
    const {
      state: {pollingEnabled},
    } = this.props;

    return (
      <Bar>
        <ControlButton onClick={this.onClickReset}>
          <Text>filterpanel.reset</Text>
        </ControlButton>
        <ControlButton onClick={this.onClickUpdate}>
          <Text>general.update</Text>
        </ControlButton>
        <PollToggle
          type="checkbox"
          onChange={this.onToggleLive}
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
