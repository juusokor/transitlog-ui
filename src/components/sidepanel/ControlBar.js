import React, {Component} from "react";
import styled from "styled-components";
import {Text} from "../../helpers/text";
import {Button} from "../Forms";
import {observer} from "mobx-react";

const Bar = styled.div`
  padding: 0.5rem 1rem;
  background: var(--lightest-grey);
  border-bottom: 1px solid var(--alt-grey);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

@observer
class ControlBar extends Component {
  render() {
    const {onResetClick, onUpdateClick} = this.props;

    return (
      <Bar>
        <Button small onClick={onResetClick}>
          <Text>filterpanel.reset</Text>
        </Button>
        <Button small onClick={onUpdateClick}>
          <Text>Update</Text>
        </Button>
      </Bar>
    );
  }
}

export default ControlBar;
