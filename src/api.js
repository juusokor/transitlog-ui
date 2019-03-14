import {ApolloClient} from "apollo-client";
import {concat, split, ApolloLink} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {onError} from "apollo-link-error";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";

const joreUrl = process.env.REACT_APP_JORE_GRAPHQL_URL;
const hfpUrl = process.env.REACT_APP_HFP_GRAPHQL_URL;
const serverUrl = process.env.REACT_APP_TRANSITLOG_SERVER;

if (!joreUrl) {
  console.error("JORE GraphQL URL not set!");
}

if (!hfpUrl) {
  console.error("HFP GraphQL URL not set!");
}

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
}

let createdClient = null;
let serverClient = null;

export const getServerClient = () => {
  if (serverClient) {
    return serverClient;
  }

  const errorLink = createErrorLink();

  const cache = new InMemoryCache();

  const serverLink = new HttpLink({
    uri: serverUrl,
  });

  serverClient = new ApolloClient({
    link: concat(errorLink, serverLink),
    cache: cache,
  });

  return serverClient;
};

export const getClient = async (UIStore) => {
  if (createdClient) {
    return createdClient;
  }

  const errorLink = createErrorLink(UIStore);

  const dedupVehiclesLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((data) => {
      if (data.data.vehicles.length > 5000) {
        data.data.vehicles = uniqBy(data.data.vehicles, "tst");
      }

      return data;
    });
  });

  const cache = new InMemoryCache();

  const joreLink = new HttpLink({
    uri: joreUrl,
  });

  const hfpLink = concat(
    dedupVehiclesLink,
    new HttpLink({
      uri: hfpUrl,
    })
  );

  // Split the operation between the JORE api and the HFP api depending on the query.
  // Since the HFP api only has one query we can just check if we're fetching that.
  const splitLink = split(
    (operation) => {
      const queryName = get(
        operation,
        // Need to dig a little deeper for unnamed queries
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
