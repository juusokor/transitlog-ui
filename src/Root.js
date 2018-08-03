import React, {Component} from "react";
import App from "./components/App";
import {joreClient} from "./api";
import {ApolloProvider} from "react-apollo";

class Root extends Component {
  render() {
    return (
      <ApolloProvider client={joreClient}>
        <App />
      </ApolloProvider>
    );
  }
}

export default Root;
