import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";
import {InputBase} from "./Forms";

const SelectWrapper = styled.div`
  width: 100%;
`;

const Select = styled(InputBase.withComponent("select"))`
  padding: 0 0.7rem;
`;

@observer
class Dropdown extends Component {
  render() {
    return (
      <SelectWrapper>
        <Select {...this.props} />
      </SelectWrapper>
    );
  }
}

export default Dropdown;
