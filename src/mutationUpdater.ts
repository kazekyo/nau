/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApolloCache, ApolloLink, Reference, StoreObject, TypePolicy } from '@apollo/client';
import { DocumentNode, visit } from 'graphql/language';
import isMatch from 'lodash.ismatch';
import { encode, decode } from 'js-base64';

const INSERT_NODE_DIRECTIVES = ['appendNode', 'prependNode'];

const transform = (input: DocumentNode) => {
  // TODO : Run only for mutation
  return visit(input, {
    VariableDefinition: {
      enter(node) {
        if (node.variable.name.value === 'connections') {
          return null;
        }
      },
    },
    Directive: {
      enter(node) {
        if (INSERT_NODE_DIRECTIVES.includes(node.name.value)) {
          return null;
        }
      },
    },
  });
};

export const createMutationUpdaterLink = (): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    operation.query = transform(operation.query);
    // TODO : Consider subscriptions
    // https://github.com/cult-of-coders/apollo-client-transformers/blob/master/src/index.ts
    return forward(operation).map(({ data, ...response }) => {
      return { ...response, data };
    });
  });
};

const insertNode = <T>({
  cache,
  nodeRef,
  connectionId,
  edgeTypeName,
  type,
}: {
  cache: ApolloCache<T>;
  nodeRef: Reference;
  connectionId: string;
  edgeTypeName: string;
  type: string;
}) => {
  const connectionInfo = JSON.parse(decode(connectionId)) as {
    object: { id: string; __typename: string };
    field: string;
    keyArgs: Record<string, unknown>;
  };
  cache.modify({
    id: connectionInfo.object && cache.identify(connectionInfo.object),
    fields: {
      [connectionInfo.field]: (
        existingConnection: StoreObject & {
          edges: StoreObject[];
          args?: Record<string, unknown>;
        },
      ) => {
        if (
          existingConnection.args &&
          connectionInfo.keyArgs &&
          !isMatch(existingConnection.args, connectionInfo.keyArgs)
        ) {
          return { ...existingConnection };
        }
        const newEdge = { __typename: edgeTypeName, node: nodeRef, cursor: '' };
        const edges =
          type === 'appendNode' ? [...existingConnection.edges, newEdge] : [newEdge, ...existingConnection.edges];
        return {
          ...existingConnection,
          edges,
        };
      },
    },
  });
};

export const mutationUpdater = (): TypePolicy => {
  return {
    merge(existing: Reference, incoming: Reference, { cache, field, storeFieldName }) {
      const result = { ...existing, ...incoming };
      const directiveName = field?.directives?.find((directive) =>
        INSERT_NODE_DIRECTIVES.includes(directive.name.value),
      )?.name.value;
      if (!directiveName) return result;

      const connectionsStr = /"connections":(?<connections>\[[^\].]+\])/.exec(storeFieldName)?.groups?.connections;
      const connections = connectionsStr && (JSON.parse(connectionsStr) as string[]);
      const edgeTypeName = /"edgeTypeName":[^"]*"(?<edgeTypeName>.+)"/.exec(storeFieldName)?.groups?.edgeTypeName;
      if (!connections || !edgeTypeName) return result;
      connections.forEach((connectionId) =>
        insertNode({ cache, nodeRef: incoming, connectionId, edgeTypeName, type: directiveName }),
      );

      return result;
    },
  };
};

export const generateConnectionId = (connectionInfo: {
  object: { id: string; __typename: string } | Record<string, unknown>;
  field: string;
}): string => encode(JSON.stringify(connectionInfo));
