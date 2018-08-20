import React from "react";
import App from "./components/App";
import {joreClient} from "./api";
import {ApolloProvider} from "react-apollo";
import {observer} from "mobx-react";

const Root = observer(() => (
  <ApolloProvider client={joreClient}>
    <App />
  </ApolloProvider>
));

export default Root;
