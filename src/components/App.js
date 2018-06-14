import React, {Component} from 'react'
import './App.css'
import {LeafletMap} from './LeafletMap'
import {FilterPanel} from './FilterPanel'
import {ApolloClient} from "apollo-boost"
import {HttpLink} from 'apollo-link-http'
import {ApolloProvider} from 'react-apollo'
import {InMemoryCache} from 'apollo-cache-inmemory'

const client = new ApolloClient({
  link: new HttpLink({uri: "https://kartat.hsldev.com/jore/graphql"}),
  cache: new InMemoryCache()
});

class App extends Component {
  
  constructor() {
    super();
    this.state = {
      selectedRoute: {lineId: '1006', dateBegin: '2017-08-14', dateEnd: '2018-12-31'}
    }
  }

  onRouteSelected = ({lineId, dateBegin, dateEnd}) => {
    this.setState({selectedRoute: {lineId, dateBegin, dateEnd}});
  }

  render() {
    return (
    <ApolloProvider client={client}>  
      <div className="transitlog">
        <FilterPanel selectedRoute={this.state.selectedRoute} onRouteSelected={this.onRouteSelected}/>
        <LeafletMap selectedRoute={this.state.selectedRoute}/>
      </div>
    </ApolloProvider>
    )
  }
}

export default App
