import React from "react";
import {hot} from "react-hot-loader";
import App from "./components/App";
import {joreClient} from "./api";
import {ApolloProvider} from "react-apollo";
import {observer} from "mobx-react";

const Root = observer(() => (
  <ApolloProvider client={joreClient}>
    <App />
  </ApolloProvider>
));

export default hot(module)(Root);
