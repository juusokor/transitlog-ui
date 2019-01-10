import {ApolloClient} from "apollo-client";
import {concat, split} from "apollo-link";
import {BatchHttpLink} from "apollo-link-batch-http";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {CachePersistor} from "apollo-cache-persist";
import {onError} from "apollo-link-error";
import localforage from "localforage";
import get from "lodash/get";

const joreUrl = process.env.REACT_APP_JORE_GRAPHQL_URL;
const hfpUrl = process.env.REACT_APP_HFP_GRAPHQL_URL;

if (!joreUrl) {
  console.error("JORE GraphQL URL not set!");
}

if (!hfpUrl) {
  console.error("HFP GraphQL URL not set!");
}

let createdClient = null;

export const getClient = (UIStore) => {
  if (createdClient) {
    return createdClient;
  }

  function notifyError(type, message) {
    if (UIStore) {
      return UIStore.addError(type, message);
    }

    console.warn(`${type} error: ${message}`);
  }

  const errorLink = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors && process.env.NODE_ENV === "development") {
      graphQLErrors.map(({message}) => console.warn(message));
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

  const cache = new InMemoryCache();

  const joreLink = new BatchHttpLink({
    uri: joreUrl,
    batchMax: 100,
    batchInterval: 10,
  });

  const hfpLink = new HttpLink({
    uri: hfpUrl,
  });

  const splitLink = split(
    (operation) => {
      if (operation.operationName === "hfpQuery") {
        return false;
      }

      if (
        get(
          operation,
          "query.definitions[0].selectionSet.selections[0].name.value",
          "none"
        ) === "vehicles"
      ) {
        return false;
      }

      return true;
    },
    joreLink,
    hfpLink
  );

  createdClient = new ApolloClient({
    link: concat(errorLink, splitLink),
    cache: cache,
  });

  return createdClient;
};
