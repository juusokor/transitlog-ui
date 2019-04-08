import {ApolloClient} from "apollo-client";
import {concat} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {onError} from "apollo-link-error";
import get from "lodash/get";

const serverUrl = process.env.REACT_APP_TRANSITLOG_SERVER_GRAPHQL;
console.log(serverUrl);
if (!serverUrl) {
  console.error("Tansitlog server URL not set!");
}

function createErrorLink(UIStore) {
  function notifyError(type, message) {
    if (UIStore) {
      return UIStore.addError(type, message);
    }

    console.warn(`${type} error: ${message}`);
  }

  return onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors && process.env.NODE_ENV === "development") {
      graphQLErrors.map((err) => console.warn(err.message));
    }

    if (networkError) {
      notifyError(
        "Network",
        get(
          networkError,
          "message",
          JSON.stringify(get(networkError, "result", networkError))
        )
      );
    }
  });
}

let createdClient = null;

export const getClient = (UIStore) => {
  if (createdClient) {
    return createdClient;
  }

  const errorLink = createErrorLink(UIStore);
  const cache = new InMemoryCache();

  const httpLink = new HttpLink({
    uri: serverUrl,
  });

  createdClient = new ApolloClient({
    link: concat(errorLink, httpLink),
    cache: cache,
  });

  return createdClient;
};
