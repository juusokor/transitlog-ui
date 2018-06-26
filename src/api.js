import {ApolloClient} from 'apollo-boost';
import {HttpLink} from  'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';

const joreClient = new ApolloClient({
    link: new HttpLink({uri: "https://kartat.hsldev.com/jore/graphql"}),
    cache: new InMemoryCache(),
});

const digiTClient = new ApolloClient({
    link: new HttpLink({uri: "https://api.digitransit.fi/graphql"}),
    cache: new InMemoryCache(),
});

const hfpClient = new ApolloClient({
    link: new HttpLink({uri: "https://sandbox-1.hsldev.com/transitlog-timescaledb/graphql"}),
    cache: new InMemoryCache(),
});

export {joreClient, digiTClient, hfpClient};