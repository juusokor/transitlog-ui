import React from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import styled from "styled-components";
import HSLLogoNoText from "../icons/HSLLogoNoText";
import Login from "../icons/Login";
import {logout} from "../auth/authService";
import {AUTH_STATE_STORAGE_KEY} from "../constants";

const AUTH_URI = process.env.REACT_APP_AUTH_URI;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const SCOPE = process.env.REACT_APP_AUTH_SCOPE;

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

const LoginButton = styled.button`
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
  font-family: inherit;
  
  :hover {
    background-color: #FFF;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 3px 14px rgba(0, 0, 0, 0.4);
`;

const LoginText = styled.span`
  margin-left: 10px;
`;

const Title = styled.h2`
  margin-top: 10px 0px 10px 0px;
`;

@inject(app("UI"))
@observer
class LoginModal extends React.Component {
  onModalClick = (e) => {
    e.stopPropagation();
    if (e.currentTarget.className.includes("Root")) {
      this.props.UI.toggleLoginModal();
    }
  };

  onLogoutClick = () => {
    logout().then((response) => {
      if (response.status === 200) {
        this.props.UI.setUser(null);
      }
      this.props.UI.toggleLoginModal();
    });
  };

  openAuthForm = (type) => () => {
    const urlState = window.location.href
      .replace(window.location.origin, "")
      .replace(/^[^?]+/g, "");

    if (urlState && urlState.length > 1) {
      sessionStorage.setItem(AUTH_STATE_STORAGE_KEY, urlState);
    }

    let authUrl = `${AUTH_URI}?ns=hsl-transitlog&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&ui_locales=en`;

    if (type === "register") {
      authUrl += "&nur";
    }

    window.location.assign(authUrl);
  };

  render() {
    const {state} = this.props;
    const {user} = state;

    return (
      <Root onClick={(e) => this.onModalClick(e)}>
        <Wrapper onClick={(e) => this.onModalClick(e)}>
          <Header>
            <HSLLogoNoText fill={"white"} height={"80px"} />
            <Title>HSL Transitlog</Title>
          </Header>
          {user ? (
            <LoginButton onClick={this.onLogoutClick}>
              <Login height={"1em"} fill={"#3e3e3e"} />
              <LoginText>Kirjaudu ulos</LoginText>
            </LoginButton>
          ) : (
            <>
              <p>
                <LoginButton onClick={this.openAuthForm("login")}>
                  <Login height={"1em"} fill={"#3e3e3e"} />
                  <LoginText>Kirjaudu (HSL ID)</LoginText>
                </LoginButton>
              </p>
              <p>
                <LoginButton onClick={this.openAuthForm("register")}>
                  <Login height={"1em"} fill={"#3e3e3e"} />
                  <LoginText>Tee Transitlog-tunnus</LoginText>
                </LoginButton>
              </p>
            </>
          )}
        </Wrapper>
      </Root>
    );
  }
}

export default LoginModal;
