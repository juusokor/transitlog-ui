import {ApolloClient} from "apollo-client";
import {concat, split} from "apollo-link";
import {BatchHttpLink} from "apollo-link-batch-http";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import {CachePersistor} from "apollo-cache-persist";
import {onError} from "apollo-link-error";
import localforage from "localforage";
import get from "lodash/get";

const SCHEMA_VERSION = "1"; // Must be a string.
const SCHEMA_VERSION_KEY = "apollo-schema-version";

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
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (graphQLErrors)
      graphQLErrors.map(({message}) => notifyError("GraphQL", message));

    if (networkError) {
      notifyError("Network", networkError);
    }
  });

  const cache = new InMemoryCache();

  const cacheStorage = localforage.createInstance({
    name: "transitlogStorage",
    storeName: "transitlog_storage",
    driver: localforage.INDEXEDDB,
    size: 10000000000,
  });

  const persistor = new CachePersistor({
    cache: cache,
    storage: cacheStorage,
    serialize: false,
    key: "persisted_transitlog_cache",
    maxSize: 10000000000, // 4 gb
  });

  // Read the current schema version from AsyncStorage.
  const currentVersion = await localforage.getItem(SCHEMA_VERSION_KEY);

  if (currentVersion === SCHEMA_VERSION) {
    // If the current version matches the latest version,
    // we're good to go and can restore the cache.
    await persistor.restore();
  } else {
    // Otherwise, we'll want to purge the outdated persisted cache
    // and mark ourselves as having updated to the latest version.
    await persistor.purge();
    await localforage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
  }

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
