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
  padding: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 8rem;
  flex: 0 0 auto;
`;

const MainHeading = styled(Heading).attrs({level: 1})`
  color: white;
  flex: 1 1 auto;
  margin: 0.5rem 1.25rem 0 1rem;
  text-align: right;
  font-size: 1.75rem;
  justify-content: flex-end;
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

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 1rem;
  flex: 1 0 100%;
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right: 1.5rem;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  -ms-flex-pack: end;
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
      <Logo src={logo} alt="logo" />
      <MainHeading>
        <Text>filterpanel.heading</Text>
      </MainHeading>
      <BottomRow>
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
      </BottomRow>
      <LoginContainer>
        {user && <Username>{user}</Username>}
        <LoginIconContainer>
          <Login height={"1em"} fill={"white"} onClick={() => UI.toggleLoginModal()} />
        </LoginIconContainer>
      </LoginContainer>
    </Header>
  );
}

export default decorate(HeaderComponent);
