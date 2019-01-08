import {ApolloClient} from "apollo-client";
import {concat, split} from "apollo-link";
import {BatchHttpLink} from "apollo-link-batch-http";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {persistCache} from "apollo-cache-persist";
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

const errorLink = onError(({graphQLErrors, networkError}) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (graphQLErrors)
    graphQLErrors.map(({message, locations, path}) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}, Path: ${path}`
      )
    );

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const cache = new InMemoryCache();

const cacheStorage = localforage.createInstance({
  name: "transitlogStorage",
  storeName: "transitlog_storage",
  driver: localforage.INDEXEDDB,
});

persistCache({
  cache: cache,
  storage: cacheStorage,
  serialize: false,
  key: "persisted_transitlog_cache",
  maxSize: 4000000000, // 4 gb
});

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

const client = new ApolloClient({
  link: concat(errorLink, splitLink),
  cache: cache,
});

export {client};
