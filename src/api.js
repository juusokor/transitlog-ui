import {ApolloClient} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";

const joreUrl = process.env.REACT_APP_JORE_GRAPHQL_URL;
const hfpUrl = process.env.REACT_APP_HFP_GRAPHQL_URL;

if (!joreUrl) {
  console.error("JORE GraphQL URL not set!");
}

if (!hfpUrl) {
  console.error("HFP GraphQL URL not set!");
}

const joreCache = new InMemoryCache();

const joreClient = new ApolloClient({
  link: new HttpLink({uri: joreUrl}),
  cache: joreCache,
});

const hfpCache = new InMemoryCache();

const hfpClient = new ApolloClient({
  link: new HttpLink({
    uri: hfpUrl,
  }),
  cache: hfpCache,
});

export {joreClient, hfpClient};
