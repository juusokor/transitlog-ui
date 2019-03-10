import React from "react";
import {hot} from "react-hot-loader";
import App from "./components/App";
import {getClient} from "./api";
import {ApolloProvider} from "react-apollo";
import {observer, inject} from "mobx-react";
import {GlobalFormStyle} from "./components/Forms";
import {app} from "mobx-app";
import {observable, runInAction} from "mobx";
import Loading from "./components/Loading";
import {ModalProvider, BaseModalBackground} from "styled-react-modal";
import styled from "styled-components";

const SpecialModalBackground = styled(BaseModalBackground)`
  z-index: 100;
  background: rgba(0, 0, 0, 0.1);
`;

@inject(app("UI"))
@observer
class Root extends React.Component {
  @observable.ref
  client = null;

  async componentDidMount() {
    const {UI} = this.props;
    const client = await getClient(UI);

    runInAction(() => (this.client = client));
  }

  render() {
    if (!this.client) {
      return <Loading />;
    }

    return (
      <ApolloProvider client={this.client}>
        <ModalProvider backgroundComponent={SpecialModalBackground}>
          <>
            <GlobalFormStyle />
            <App />
          </>
        </ModalProvider>
      </ApolloProvider>
    );
  }
}

export default hot(module)(Root);
