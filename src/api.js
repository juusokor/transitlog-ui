import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache, defaultDataIdFromObject} from "apollo-cache-inmemory";

const joreClient = new ApolloClient({
  link: new HttpLink({uri: "https://dev-kartat.hsldev.com/jore-history/graphql"}),
  cache: new InMemoryCache({
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
  }),
});

const cache = new InMemoryCache();

const hfpClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://sandbox-1.hsldev.com/v1alpha1/graphql",
  }),
  cache,
});

export {joreClient, hfpClient};
