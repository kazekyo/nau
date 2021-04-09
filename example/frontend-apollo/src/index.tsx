import {
  ApolloClient,
  ApolloProvider,
  FieldFunctionOptions,
  from,
  HttpLink,
  InMemoryCache,
  Reference,
  StoreObject,
} from '@apollo/client';
import {
  createMutationUpdaterLink,
  idAsCacheId,
  mutationUpdater,
  relayStylePagination,
} from '@kazekyo/apollo-relay-style-pagination';
import { decode } from 'js-base64';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const links = from([createMutationUpdaterLink(), new HttpLink({ uri: 'http://localhost:4000/graphql' })]);

const DELETE_NODE_DIRECTIVES = ['deleteNode'];

type ConnectionInfo = {
  id: string;
  field: string;
  keyArgs?: Record<string, unknown>;
};

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
        RemoveRobotPayload: {
          merge(
            existing: Reference,
            incoming: { robot: { __ref: string } },
            { cache, field, storeFieldName }: FieldFunctionOptions,
          ) {
            const result = { ...existing, ...incoming };

            const keys = Object.keys(incoming);
            console.log(keys);
            // TODO : keysからdirective nameを取得する
            const directiveName = keys.find((key) => DELETE_NODE_DIRECTIVES.includes(key));
            console.log(incoming.robot);
            console.log(directiveName);
            if (!directiveName) return result;
            console.log(directiveName);

            const connectionsStr = /"connections":(?<connections>\[[^\].]+\])/.exec(storeFieldName)?.groups
              ?.connections;
            const connections = connectionsStr && (JSON.parse(connectionsStr) as string[]);
            const edgeTypeName = /"edgeTypeName":[^"]*"(?<edgeTypeName>.+)"/.exec(storeFieldName)?.groups?.edgeTypeName;
            if (!connections || !edgeTypeName) return result;
            console.log(connections);

            connections.forEach((connectionId) => {
              const connectionInfo = JSON.parse(decode(connectionId)) as ConnectionInfo;
              console.log(connectionInfo);
              cache.modify({
                id: connectionInfo.id,
                fields: {
                  robots: (
                    existingConnection: StoreObject & {
                      edges: Array<StoreObject & { node: Reference }>;
                      args?: Record<string, unknown>;
                    },
                  ) => {
                    const cacheId = incoming.robot.__ref;
                    const edges = existingConnection.edges.filter((edge) => cache.identify(edge.node) !== cacheId);
                    return {
                      ...existingConnection,
                      edges,
                    };
                  },
                },
              });
            });
            return result;
          },
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
