import { ApolloCache, FieldFunctionOptions, Reference, StoreObject } from '@apollo/client';
import { FieldNode } from 'graphql/language';
import { decode } from 'js-base64';
import isMatch from 'lodash.ismatch';
import { nonNullable } from '../../utils';
import { CacheIdGenerator } from './cacheIdGenerator';
import { DirectiveName, findDirectiveName, INSERT_NODE_DIRECTIVE_NAMES } from './directiveName';
import { ConnectionInfo } from './generateConnectionId';

const ROOT_QUERY_KEY = 'ROOT_QUERY';
const getCacheId = ({ id, cacheIdGenerator }: { id?: string; cacheIdGenerator: CacheIdGenerator }): string => {
  return !id || id === ROOT_QUERY_KEY ? ROOT_QUERY_KEY : cacheIdGenerator(id);
};

const validate = ({
  connectionInfo,
  cacheIdGenerator,
  directiveName,
  readField,
  toReference,
}: {
  connectionInfo: ConnectionInfo;
  cacheIdGenerator: CacheIdGenerator;
  directiveName: DirectiveName;
} & Pick<FieldFunctionOptions, 'readField' | 'toReference'>):
  | { success: false; errorMessage: string }
  | { success: true } => {
  if (!connectionInfo.field) {
    const blankField = 'field';
    return {
      success: false,
      errorMessage: `\`${blankField}\` in connectionId set in @${directiveName} cannot be undefined, null and an empty string.`,
    };
  }

  const parentRefKey = getCacheId({ id: connectionInfo.id, cacheIdGenerator });
  const parentRef = toReference(parentRefKey);
  if (!parentRef) {
    return {
      success: false,
      errorMessage: `\`${parentRefKey}\` does not exist in the cache of Apollo.`,
    };
  }

  const targetFieldData = readField({ fieldName: connectionInfo.field, from: parentRef, args: connectionInfo.args });
  if (!targetFieldData) {
    const typename = readField<string | undefined>({ fieldName: '__typename', from: parentRef });
    const typenameMessage = typename ? ` in ${typename}(${parentRef.__ref})` : '';
    return {
      success: false,
      errorMessage: `A connection named \`${connectionInfo.field}\`(args: ${JSON.stringify(
        connectionInfo.args,
      )}) does not exist${typenameMessage}.`,
    };
  }

  return { success: true };
};

export const insertNodesToConnections = ({
  object,
  cacheIdGenerator,
  cache,
  field,
  storeFieldName,
  readField,
  toReference,
}: {
  object: Reference;
  cacheIdGenerator: CacheIdGenerator;
} & Pick<FieldFunctionOptions, 'cache' | 'field' | 'storeFieldName' | 'readField' | 'toReference'>): void => {
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
  connections.forEach((connectionId) => {
    const connectionInfo = JSON.parse(decode(connectionId)) as ConnectionInfo;

    const validateResult = validate({ connectionInfo, cacheIdGenerator, directiveName, readField, toReference });
    if (!validateResult.success) {
      throw Error(validateResult.errorMessage);
    }

    insertNode({
      cache,
      nodeRef: object,
      connectionInfo,
      edgeTypeName,
      type: directiveName,
      cacheIdGenerator,
    });
  });
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
  connectionInfo,
  edgeTypeName,
  type,
  cacheIdGenerator,
}: {
  cache: ApolloCache<T>;
  nodeRef: Reference;
  connectionInfo: ConnectionInfo;
  edgeTypeName: string;
  type: string;
  cacheIdGenerator: CacheIdGenerator;
}) => {
  cache.modify({
    id: getCacheId({ id: connectionInfo.id, cacheIdGenerator }),
    fields: {
      [connectionInfo.field]: (
        existingConnection: StoreObject & {
          edges: ReadonlyArray<{ node: { __ref: string } }>;
          args?: Record<string, unknown>;
        },
      ) => {
        if (existingConnection.args && connectionInfo.args && !isMatch(existingConnection.args, connectionInfo.args)) {
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
