import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";
import {StyledInputBase} from "./Forms";

const Select = styled(StyledInputBase.withComponent("select"))`
  padding: 0 0.7rem;
  width: 100%;
`;

@observer
class Dropdown extends Component {
  state = {
    isEmpty: !this.props.value,
  };

  onChange = (e) => {
    const {onChange} = this.props;

    if (!e.target.value) {
      this.setState({
        isEmpty: true,
      });
    } else {
      this.setState({
        isEmpty: false,
      });
    }

    onChange(e);
  };

  render() {
    const {className, ...props} = this.props;
    const {isEmpty} = this.state;

    return (
      <Select
        {...props}
        onChange={this.onChange}
        className={`${className} ${isEmpty ? "empty-select" : ""}`}
      />
    );
  }
}

export default Dropdown;
