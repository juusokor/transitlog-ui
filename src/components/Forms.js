import styled, {injectGlobal} from "styled-components";

injectGlobal`
  select,
  input,
  button,
  textarea {
    width: 100%;
  }
`;

export const ControlGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--alt-grey);
  outline: none;
`;

export const Button = styled.button`
  appearance: none;
  outline: none;
  border-radius: 1rem;
  border: 1px solid var(--blue);
  background: var(--blue);
  letter-spacing: -0.6px;
  padding: 1rem;
  color: white;
  user-select: none;
  flex: 0;
`;
