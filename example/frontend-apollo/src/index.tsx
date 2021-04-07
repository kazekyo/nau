import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache, StoreObject } from '@apollo/client';
import {
  createMutationUpdaterLink,
  mutationUpdater,
  relayStylePagination,
} from '@kazekyo/apollo-relay-style-pagination';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const links = from([createMutationUpdaterLink(), new HttpLink({ uri: 'http://localhost:4000/graphql' })]);

// TODO : Move apollo-relay-style-pagination/src
type TypePolicies = { [key: string]: { [key: string]: unknown } };
const idAsCacheId = (
  typePolicies: TypePolicies,
  options?: { idFieldName?: string; excludes?: string[] },
): TypePolicies =>
  Object.fromEntries(
    Object.entries(typePolicies).map(([typeName, object]) => {
      const excludes = options?.excludes || [];
      const newObject = excludes.includes(typeName)
        ? object
        : {
            ...object,
            keyFields: (obj: Readonly<StoreObject>): string => {
              if (options?.idFieldName) {
                return obj[options.idFieldName] as string;
              } else {
                return obj.id as string;
              }
            },
          };
      return [typeName, newObject];
    }),
  );

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
      { idFieldName: 'id', excludes: ['User'] },
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
