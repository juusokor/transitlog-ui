import styled from "styled-components";

export const SmallText = styled.span`
  display: block;
  font-size: 0.75rem;
`;

const getTerminus = (origin, destination, not) => ({terminus = false}) =>
  terminus === "origin" ? origin : terminus === "destination" ? destination : not;

export const StopMarker = styled.div`
  border-radius: 50%;
  flex: 0 0 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border: 3px solid var(--blue);
`;

export const StopElementsWrapper = styled.div`
  display: flex;
  align-self: stretch;
  flex-direction: column;
  align-items: center;
  justify-content: ${getTerminus("flex-start", "flex-end", "center")};
  width: 3px;
  background: var(--blue);
  margin: ${getTerminus("0.4rem", "0", "0")} 1rem ${getTerminus("0", "0.5rem", "0")};
`;
