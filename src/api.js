import {ApolloClient} from "apollo-client";
import {BatchHttpLink} from "apollo-link-batch-http";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache, defaultDataIdFromObject} from "apollo-cache-inmemory";
import {persistCache} from "apollo-cache-persist";
import localforage from "localforage";

const joreUrl = process.env.REACT_APP_JORE_GRAPHQL_URL;
const hfpUrl = process.env.REACT_APP_HFP_GRAPHQL_URL;

if (!joreUrl) {
  console.error("JORE GraphQL URL not set!");
}

if (!hfpUrl) {
  console.error("HFP GraphQL URL not set!");
}

const joreCache = new InMemoryCache({
  dataIdFromObject: (obj) => {
    if (obj.__typename === "Stop") {
      return `Stop:${obj.stopId}`;
    }

    if (typeof obj.nodeId !== "undefined") {
      return obj.nodeId;
    }

    if (obj.__typename === "Line") {
      return `${obj.lineId}:${obj.dateBegin}:${obj.dateEnd}`;
    }

    return defaultDataIdFromObject(obj);
  },
});

const joreStorage = localforage.createInstance({
  name: "joreStorage",
  storeName: "jore_storage",
  driver: localforage.INDEXEDDB,
});

persistCache({
  cache: joreCache,
  storage: joreStorage,
  serialize: false,
  key: "persisted_jore",
  maxSize: 1000000000, // 1 gb
});

const joreClient = new ApolloClient({
  link: new BatchHttpLink({
    uri: joreUrl,
    batchMax: 100,
    batchInterval: 10,
  }),
  cache: joreCache,
});

const hfpCache = new InMemoryCache();
const hfpStorage = localforage.createInstance({
  name: "hfpStorage",
  storeName: "hfp_storage",
  driver: localforage.INDEXEDDB,
});

persistCache({
  cache: hfpCache,
  storage: hfpStorage,
  serialize: false,
  key: "persisted_hfp",
  maxSize: 3000000000, // 3 gb
});

const hfpClient = new ApolloClient({
  link: new HttpLink({
    uri: hfpUrl,
  }),
  cache: hfpCache,
});

export {joreClient, hfpClient};
