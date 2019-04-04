import React from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import styled from "styled-components";
import HSLLogoNoText from "../icons/HSLLogoNoText";
import Login from "../icons/Login";

const Root = styled.div`
  position: fixed;
  z-index: 800;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
`;

const Wrapper = styled.div`
  position: fixed;
  z-index: 900;
  top: 50%;
  left: 50%;
  padding: 30px 90px;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 3px 14px rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  text-align: center;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  color: #fff;
  background-color: #007ac9a6;
`;

const Header = styled.div`
  padding: 10px 0px 10px 0px;
  user-select: none;
`;

const LoginButton = styled.div`
  display: flex;
  flex-basis: 50px;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  user-select: none;
  width: 225px;
  cursor: pointer;
  border-radius: 2px;
  background-color: #ffffffe6;
  color: #3e3e3e;
  padding: 15px;
  :hover {
    background-color: #FFF;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 3px 14px rgba(0, 0, 0, 0.4);
`;

const LoginText = styled.div`
  margin-left: 10px;
`;

const LoginWrapper = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
`;

const Title = styled.h2`
  margin-top: 10px 0px 10px 0px;
`;

const Logout = styled.div`
  display:flex;
  color: #0077c7;
  cursor: pointer;
  flex-direction: column;
  flex-grow: 0;
  text-align: right;
  :hover {
    color: rgb(51, 51, 51);
`;

const Username = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

@inject(app("Filters", "UI"))
@observer
class LoginModal extends React.Component {
  constructor(props) {
    super(props);

    this.asd = this.asd.bind(this);
  }

  asd(e) {
    e.stopPropagation();
    const {state} = this.props;
    console.log(state.loginModalOpen);
    if (e.currentTarget.className.includes("Root")) {
      this.props.UI.toggleLoginModal();
    }
  }

  render() {
    return (
      <Root onClick={(e) => this.asd(e)}>
        <Wrapper onClick={(e) => this.asd(e)}>
          <Header>
            <HSLLogoNoText fill={"white"} height={"80px"} />
            <Title>HSL Transitlog</Title>
          </Header>
          <LoginButton>
            <Login height={"1em"} fill={"#3e3e3e"} />
            <LoginText>Kirjaudu (HSL ID)</LoginText>
          </LoginButton>
        </Wrapper>
      </Root>
    );
  }
}

export default LoginModal;
