import {ApolloClient} from "apollo-client";
import {concat, split, ApolloLink} from "apollo-link";
import {BatchHttpLink} from "apollo-link-batch-http";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {onError} from "apollo-link-error";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";

const joreUrl = process.env.REACT_APP_JORE_GRAPHQL_URL;
const hfpUrl = process.env.REACT_APP_HFP_GRAPHQL_URL;

if (!joreUrl) {
  console.error("JORE GraphQL URL not set!");
}

if (!hfpUrl) {
  console.error("HFP GraphQL URL not set!");
}

let createdClient = null;

export const getClient = async (UIStore) => {
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

  const dedupVehiclesLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((data) => {
      if (data.data.vehicles.length > 5000) {
        data.data.vehicles = uniqBy(data.data.vehicles, "tst");
      }

      return data;
    });
  });

  const cache = new InMemoryCache();

  const joreLink = new BatchHttpLink({
    uri: joreUrl,
    batchMax: 10,
    batchInterval: 10,
  });

  const hfpLink = concat(
    dedupVehiclesLink,
    new HttpLink({
      uri: hfpUrl,
    })
  );

  // Split the operation between the JORE api and the HFP api depending on the query.
  const splitLink = split(
    (operation) => {
      const queryName = get(
        operation,
        "query.definitions[0].selectionSet.selections[0].name.value",
        "none"
      );

      if (operation.operationName === "hfpQuery" || queryName === "vehicles") {
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
