import {Heading} from "./Typography";
import styled from "styled-components";

export const ListHeading = styled(Heading).attrs({level: 5})`
  padding: 0 0 0.5rem 1rem;
  margin: 1rem 0 0 !important;
  border-bottom: 1px solid var(--alt-grey);
  font-weight: normal;
  text-transform: uppercase;
`;
