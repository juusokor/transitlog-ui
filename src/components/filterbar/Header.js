import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import {Heading} from "../Typography";
import LanguageSelect from "./LanguageSelect";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import Login from "../../icons/Login";
import ControlBar from "../sidepanel/ControlBar";

const Header = styled.header`
  width: 100%;
  background: var(--blue);
  padding: 0.5rem 0.875rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 4.5rem;
  height: auto;
  flex: 0 0 auto;
`;

const MainHeading = styled(Heading).attrs({level: 1})`
  color: white;
  margin: 0 0 0 1rem;
  font-size: 1.25rem;
`;

const LogoAndHeading = styled.div`
  display: flex;
  flex: 0;
  align-items: center;
  justify-content: flex-start;
`;

const LangSelectContainer = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-start;
  margin-right: 2rem;

  div {
    flex: 0 0 auto;
    margin-right: 1rem;
  }
`;

const HeaderFeatures = styled(ControlBar)`
  align-items: center;
  flex: 0 0 auto;
  margin: 0 2rem;
`;

const LoginContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  margin-left: auto;
`;

const Username = styled.div`
  color: white;
  margin-right: 10px;
`;

const LoginIconContainer = styled.div`
  cursor: pointer;
  :hover {
    transform: scale(1.1);
  }
`;

const decorate = flow(
  observer,
  inject("UI")
);

function HeaderComponent({state, UI, className}) {
  const {user} = state;
  return (
    <Header className={className}>
      <LogoAndHeading>
        <Logo src={logo} alt="logo" />
        <MainHeading>
          <Text>filterpanel.heading</Text>
        </MainHeading>
      </LogoAndHeading>
      <HeaderFeatures />
      <LangSelectContainer>
        <LanguageSelect />
      </LangSelectContainer>
      <LoginContainer>
        {user && <Username>{user}</Username>}
        <LoginIconContainer>
          <Login height="1rem" fill="white" onClick={UI.toggleLoginModal} />
        </LoginIconContainer>
      </LoginContainer>
    </Header>
  );
}

export default decorate(HeaderComponent);
