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
  render() {
    const {UI} = this.props;

    const client = getClient(UI);

    return (
      <ApolloProvider client={client}>
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
