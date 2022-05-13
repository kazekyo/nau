import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache, PossibleTypesMap, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { relayStylePagination } from '@apollo/client/utilities';
import { ChakraProvider } from '@chakra-ui/react';
import { createCacheUpdaterLink, isSubscriptionOperation } from '@kazekyo/nau';
import { createClient } from 'graphql-ws';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { withCacheUpdater } from './generated/graphql';
import introspection from './generated/introspection-result.json';
import './index.css';
import reportWebVitals from './reportWebVitals';
const introspectionResult = introspection as { possibleTypes: PossibleTypesMap };

const wsLink = new GraphQLWsLink(createClient({ url: 'ws://localhost:4000/subscription' }));
const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });
const cacheUpdaterLink = createCacheUpdaterLink();
const splitLink = split(
  ({ query }) => isSubscriptionOperation(query),
  from([cacheUpdaterLink, wsLink]),
  from([cacheUpdaterLink, httpLink]),
);

const client = new ApolloClient({
  cache: new InMemoryCache({
    addTypename: true,
    possibleTypes: introspectionResult.possibleTypes,
    typePolicies: withCacheUpdater({
      User: {
        fields: {
          items: relayStylePagination(),
        },
      },
    }),
  }),
  link: splitLink,
});

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  // <React.StrictMode>
  <ChakraProvider>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </ChakraProvider>,
  // </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
