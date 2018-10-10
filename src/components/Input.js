import React, {Component} from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";
import {InputBase, InputLabel} from "./Forms";

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  position: relative;
  padding-top: ${({animatedLabel}) => (animatedLabel ? "2rem" : 0)};
  margin-right: 1rem;

  &:only-child {
    margin-right: 0;
  }
`;

const Label = styled(InputLabel)`
  white-space: nowrap;
  ${({animated = true}) =>
    animated
      ? css`
          position: absolute;
          bottom: 2.25rem;
          left: 0;
          transform: translate(0);
          transition: transform 0.1s ease-out;
          pointer-events: none;

          input:placeholder-shown + & {
            transform: translate(0.75rem, 2.15rem);
            font-weight: 300;
            color: var(--light-grey);
          }
        `
      : ""};
`;

@observer
class Input extends Component {
  render() {
    const {label, children, className, animatedLabel = true, ...props} = this.props;

    const inputComponent = !children ? (
      <InputBase placeholder=" " {...props} />
    ) : (
      children
    );

    return (
      <InputWrapper animatedLabel={animatedLabel} className={className}>
        {!animatedLabel && <Label animated={false}>{label}</Label>}
        {inputComponent}
        {animatedLabel && <Label animated={true}>{label}</Label>}
      </InputWrapper>
    );
  }
}

export default Input;
