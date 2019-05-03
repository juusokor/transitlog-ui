import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import {Heading} from "../Typography";
import LanguageSelect from "./LanguageSelect";
import {observer} from "mobx-react-lite";
import {Button} from "../Forms";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import Login from "../../icons/Login";

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
  width: 5rem;
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
  align-items: center;
  justify-content: flex-start;
`;

const LangSelectContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  margin-left: auto;

  div {
    flex: 0 0 auto;
    margin-right: 1rem;
  }
`;

const HeaderFeatures = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1 1 100%;
  margin-left: 1rem;
`;

const LoginContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
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
      <HeaderFeatures>
        <Button
          helpText="Share button"
          small
          transparent
          onClick={() => UI.toggleShareModal(true)}>
          <Text>general.share</Text>
        </Button>
        <LangSelectContainer>
          <LanguageSelect />
        </LangSelectContainer>
      </HeaderFeatures>
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
