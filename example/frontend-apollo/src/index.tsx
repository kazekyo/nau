import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache } from '@apollo/client';
import {
  createMutationUpdaterLink,
  idAsCacheId,
  mutationUpdater,
  relayStylePagination,
} from '@kazekyo/apollo-relay-style-pagination';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const links = from([createMutationUpdaterLink(), new HttpLink({ uri: 'http://localhost:4000/graphql' })]);

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: idAsCacheId(
      {
        User: {
          fields: {
            robots: relayStylePagination(),
          },
        },
        Robot: {
          ...mutationUpdater(),
        },
      },
      { idFieldName: 'id' },
    ),
  }),
  link: links,
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
