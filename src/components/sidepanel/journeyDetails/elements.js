import styled from "styled-components";

export const SmallText = styled.span`
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: var(--light-grey);
`;

const getTerminus = (origin, destination, not) => ({terminus = false}) =>
  terminus === "origin" ? origin : terminus === "destination" ? destination : not;

export const StopMarker = styled.div`
  border-radius: 50%;
  flex: 0 0 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border: 3px solid ${({color = "var(--blue)"}) => color};
  margin-left: -1px;
`;

export const StopElementsWrapper = styled.div`
  display: flex;
  align-self: stretch;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 3px;
  background: ${({color = "var(--blue)"}) => color};
  margin: 0 calc(0.75rem - 1.5px);

  &:after {
    content: "";
    display: ${({terminus}) => (terminus === "destination" ? "block" : "none")};
    height: 3px;
    width: 1.5rem;
    background: ${({color = "var(--blue)"}) => color};
    margin-top: auto;
  }
`;
