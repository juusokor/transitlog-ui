import React from "react";
import {hot} from "react-hot-loader";
import App from "./components/App";
import {client} from "./api";
import {ApolloProvider} from "react-apollo";
import {observer} from "mobx-react";
import DevTools from "mobx-react-devtools";
import {configureDevtool} from "mobx-react-devtools";
import {GlobalFormStyle} from "./components/Forms";

configureDevtool({
  logEnabled: false,
  updatesEnabled: false,
  // Log only changes of type `reaction`
  // (only affects top-level messages in console, not inside groups)
  logFilter: (change) => change.type === "action",
});

const Root = observer(() => (
  <ApolloProvider client={client}>
    <>
      <GlobalFormStyle />
      <App />
      <DevTools />
    </>
  </ApolloProvider>
));

export default hot(module)(Root);
