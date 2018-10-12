import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import {Heading} from "../Typography";
import LanguageSelect from "./LanguageSelect";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import {Button} from "../Forms";

const Header = styled.header`
  width: 100%;
  height: calc(9rem + 3px);
  background: var(--blue);
  padding: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 6rem;
  flex: 0 0 auto;
`;

const MainHeading = styled(Heading).attrs({level: 1})`
  color: white;
  flex: 1 1 auto;
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
`;

const LangSelectContainer = styled.div`
  flex: 1 0 100%;
  margin-top: 1rem;
  display: flex;
  align-items: center;

  div {
    flex: 0 1 40%;
    margin-right: 1rem;
  }

  button {
    flex: 0 1 60%;
  }
`;

export default inject(app("Filters"))(
  observer(({Filters}) => {
    return (
      <Header>
        <Logo src={logo} alt="logo" />
        <MainHeading>
          <Text>filterpanel.heading</Text>
        </MainHeading>
        <LangSelectContainer>
          <LanguageSelect />
          <Button small primary onClick={Filters.reset}>
            <Text>filterpanel.reset</Text>
          </Button>
        </LangSelectContainer>
      </Header>
    );
  })
);
