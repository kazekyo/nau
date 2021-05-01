import { ApolloCache, FieldFunctionOptions, Reference, StoreObject } from '@apollo/client';
import { FieldNode } from 'graphql/language';
import { decode, encode } from 'js-base64';
import isMatch from 'lodash.ismatch';
import { nonNullable } from '../utils';
import { CacheIdGenerator } from './cacheIdGenerator';
import { findDirectiveName, INSERT_NODE_DIRECTIVE_NAMES } from './directiveName';

type ConnectionInfo = {
  id: string;
  field: string;
  keyArgs?: Record<string, unknown>;
};

export const generateConnectionId = (connectionInfo: ConnectionInfo): string => encode(JSON.stringify(connectionInfo));

export const insertNodesToConnections = ({
  object,
  cacheIdGenerator,
  cache,
  field,
  storeFieldName,
}: {
  object: Reference;
  cacheIdGenerator: CacheIdGenerator;
} & Pick<FieldFunctionOptions, 'cache' | 'field' | 'storeFieldName'>): void => {
  const directiveName = findDirectiveName({
    fieldOrSelection: field,
    directiveNames: INSERT_NODE_DIRECTIVE_NAMES,
  });
  if (!directiveName) return;

  if (!object.__ref) {
    throw new Error(
      `Cache key such as id does not exist. The only fields that exist are [ ${getChildrenFieldNames(field).join(
        ', ',
      )} ]. Please add the cache key to Mutation/Subscription. Location: ${storeFieldName}`,
    );
  }

  const edgeTypeName = getEdgeTypeNameFromStoreFieldName(storeFieldName);
  const connections = getConnectionsFromStoreFieldName(storeFieldName);
  if (!connections || !edgeTypeName) return;
  connections.forEach((connectionId) =>
    insertNode({
      cache,
      nodeRef: object,
      connectionId,
      edgeTypeName,
      type: directiveName,
      cacheIdGenerator,
    }),
  );
};

const getConnectionsFromStoreFieldName = (storeFieldName: FieldFunctionOptions['storeFieldName']) => {
  const connectionsStr = /"connections":(?<connections>\[[^\].]+\])/.exec(storeFieldName)?.groups?.connections;
  return connectionsStr && (JSON.parse(connectionsStr) as string[]);
};

const getEdgeTypeNameFromStoreFieldName = (storeFieldName: FieldFunctionOptions['storeFieldName']) => {
  return /"edgeTypeName":[^"]*"(?<edgeTypeName>.+)"/.exec(storeFieldName)?.groups?.edgeTypeName;
};

const getChildrenFieldNames = (field: FieldNode | null) => {
  return (
    field?.selectionSet?.selections
      .map((selection) => (selection.kind === 'Field' ? selection.name.value : null))
      .filter(nonNullable) || []
  );
};

const insertNode = <T>({
  cache,
  nodeRef,
  connectionId,
  edgeTypeName,
  type,
  cacheIdGenerator,
}: {
  cache: ApolloCache<T>;
  nodeRef: Reference;
  connectionId: string;
  edgeTypeName: string;
  type: string;
  cacheIdGenerator: CacheIdGenerator;
}) => {
  const connectionInfo = JSON.parse(decode(connectionId)) as ConnectionInfo;
  cache.modify({
    id: cacheIdGenerator(connectionInfo.id),
    fields: {
      [connectionInfo.field]: (
        existingConnection: StoreObject & {
          edges: ReadonlyArray<{ node: { __ref: string } }>;
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
        if (existingConnection.edges.find((edge) => edge.node.__ref === nodeRef.__ref)) {
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
