import React, {Component} from 'react'

import './App.css'
import {LeafletMap} from './LeafletMap'
import {FilterPanel} from './FilterPanel'
import {ApolloClient} from "apollo-boost"
import {HttpLink} from 'apollo-link-http'
import {ApolloProvider} from 'react-apollo'
import {InMemoryCache} from 'apollo-cache-inmemory'



class App extends Component {
  
  constructor() {
    super();
    this.state= {
      selectedRoute: ''
    }
  }

  render() {
    const client = new ApolloClient({
      link: new HttpLink({uri: "https://kartat.hsldev.com/jore/graphql"}),
      cache: new InMemoryCache()
    })

    return (
    <ApolloProvider client={client}>  
      <div className="transitlog">
        <FilterPanel/>
        <LeafletMap/>
      </div>
    </ApolloProvider>
    )
  }
}

export default App
