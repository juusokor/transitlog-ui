import React from "react";
import {hot} from "react-hot-loader";
import App from "./components/App";
import {getClient} from "./api";
import {ApolloProvider} from "react-apollo";
import {observer, inject} from "mobx-react";
import DevTools from "mobx-react-devtools";
import {configureDevtool} from "mobx-react-devtools";
import {GlobalFormStyle} from "./components/Forms";
import {app} from "mobx-app";
import {observable, runInAction} from "mobx";
import Loading from "./components/Loading";

configureDevtool({
  logEnabled: false,
  updatesEnabled: false,
  // Log only changes of type `reaction`
  // (only affects top-level messages in console, not inside groups)
  logFilter: (change) => change.type === "action",
});

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
        <>
          <GlobalFormStyle />
          <App />
          <DevTools />
        </>
      </ApolloProvider>
    );
  }
}

export default hot(module)(Root);
