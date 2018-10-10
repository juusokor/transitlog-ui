import styled, {injectGlobal} from "styled-components";

injectGlobal`
  select,
  input,
  button,
  textarea {
    width: 100%;
  }
`;

const NORMAL_HEIGHT = "2.5rem";

export const ControlGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  width: 100%;
  margin: 1rem 0 0;

  &:first-child {
    margin-top: 0;
  }
`;

export const InputLabel = styled.label`
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 129%;
  letter-spacing: 0px;
  margin-bottom: 0.5rem;
  color: var(--grey);
  text-transform: uppercase;
`;

export const InputBase = styled.input`
  font-family: var(--font-family);
  padding: 0.7rem;
  border-radius: 0.25rem;
  border: 1px solid var(--alt-grey);
  outline: none;
  font-size: 1.125rem;
  height: ${NORMAL_HEIGHT};
  background-color: white;

  &:focus {
    border-color: var(--blue);
  }
`;

export const Button = styled.button`
  font-family: var(--font-family);
  font-size: ${({small = false}) => (small ? "0.875rem" : "1.125rem")};
  font-weight: 500;
  appearance: none;
  outline: none;
  border-radius: 2.5rem;
  border: 1px solid var(--blue);
  background: ${({primary = false}) => (primary ? "var(--blue)" : "white")};
  letter-spacing: -0.6px;
  padding: 0 ${({small = false}) => (small ? "1.25rem" : "1.65em")};
  color: ${({primary = false}) => (primary ? "white" : "var(--blue)")};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  flex: 1 1 auto;
  height: ${({small = false}) => (small ? "2.5rem" : "3rem")};
  cursor: pointer;
`;
