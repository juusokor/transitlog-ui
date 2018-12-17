import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache, defaultDataIdFromObject} from "apollo-cache-inmemory";

const joreUrl = process.env.REACT_APP_JORE_GRAPHQL_URL;
const hfpUrl = process.env.REACT_APP_HFP_GRAPHQL_URL;

if (!joreUrl) {
  console.error("JORE GraphQL URL not set!");
}

if (!hfpUrl) {
  console.error("HFP GraphQL URL not set!");
}

const joreClient = new ApolloClient({
  link: new HttpLink({uri: joreUrl}),
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
    uri: hfpUrl,
  }),
  cache,
});

const digiTransitClient = new ApolloClient({
  link: new HttpLink({uri: "https://api.digitransit.fi/graphql"}),
  cache: new InMemoryCache(),
});

export {joreClient, hfpClient, digiTransitClient};
