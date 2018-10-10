import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import {Heading} from "../Typography";

const Header = styled.header`
  width: 100%;
  background: var(--blue);
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 7.5rem;
  flex: 0 0 auto;
`;

const MainHeading = styled(Heading).attrs({level: 1})`
  color: white;
  flex: 1 1 auto;
  margin: 0;
  font-size: 1.75rem;
  text-align: center;
`;

export default () => {
  return (
    <Header>
      <Logo src={logo} alt="logo" />
      <MainHeading>
        <Text>filterpanel.heading</Text>
      </MainHeading>
    </Header>
  );
};
