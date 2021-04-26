import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import {
  createMutationUpdaterLink,
  isSubscription,
  relayStylePagination,
  setIdAsCacheKey,
} from '@kazekyo/apollo-relay-style-pagination';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/subscriptions',
  options: {
    reconnect: true,
  },
});
const cache = new InMemoryCache({
  typePolicies: setIdAsCacheKey(
    {
      User: {
        fields: {
          robots: relayStylePagination(),
        },
      },
      Robot: {
        // ...mutationUpdater(),
      }
    },
    { idFieldName: 'id' },
  ),
});

const splitLink = split(
  ({ query }) => isSubscription(query),
  from([createMutationUpdaterLink(cache), wsLink]),
  from([createMutationUpdaterLink(cache), new HttpLink({ uri: 'http://localhost:4000/graphql' })]),
);

const client = new ApolloClient({
  cache: cache,
  link: splitLink,
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
