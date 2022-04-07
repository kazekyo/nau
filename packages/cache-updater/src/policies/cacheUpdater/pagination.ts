import {
  FieldFunctionOptions,
  FieldMergeFunction,
  FieldReadFunction,
  Reference,
  TypePolicies,
  TypePolicy,
} from '@apollo/client';
import { StoreObject } from '@apollo/client/utilities';
import { decode, encode } from 'js-base64';
import { isMatch } from 'lodash';
import { findDirectiveName, INSERT_NODE_DIRECTIVE_NAMES } from '../../utils/directiveName';
import { findTypePolicy, generateTypePolicyPairWithTypeMergeFunction, TypePolicyPair } from './util';

export type ConnectionInfo = {
  parent: {
    id: string;
    typename: string;
  };
  connection: {
    fieldName: string;
    args: Record<string, unknown>;
  };
  edge: {
    typename: string;
  };
};

export type PaginationMeta = {
  node: {
    typename: string;
  };
  parents: {
    typename: string;
    connection: {
      fieldName: string;
    };
    edge: {
      typename: string;
    };
  }[];
};

const ROOT_QUERY_KEY = 'ROOT_QUERY';

export const generatePaginationParentTypePolicyPairs = ({
  paginationMetaList,
  typePolicies,
}: {
  paginationMetaList: PaginationMeta[];
  typePolicies: TypePolicies;
}): TypePolicyPair[] => {
  return paginationMetaList
    .map((metadata): TypePolicyPair[] => {
      return metadata.parents.map((parent) => {
        const originalTypePolicy = findTypePolicy({ key: parent.typename, typePolicies });

        const notFoundOriginalFieldTypePolicyError = Error(
          `${parent.typename}.${parent.connection.fieldName} require \`relayStylePagination\`. Please check your TypePolicy configuration.`,
        );

        if (!originalTypePolicy || !originalTypePolicy.fields) {
          throw notFoundOriginalFieldTypePolicyError;
        }

        const connectionFieldName = parent.connection.fieldName;
        const originalConnectionFieldTypePolicy = originalTypePolicy.fields[connectionFieldName];
        if (
          !originalConnectionFieldTypePolicy ||
          !('read' in originalConnectionFieldTypePolicy) ||
          !('merge' in originalConnectionFieldTypePolicy)
        ) {
          throw notFoundOriginalFieldTypePolicyError;
        }

        const mergeFieldTypePolicy: FieldMergeFunction = (
          existing: Reference,
          incoming: Reference,
          options,
          ...rest
        ) => {
          const originalFieldMerge = originalConnectionFieldTypePolicy.merge;
          if (originalFieldMerge === false || originalFieldMerge === true || !originalFieldMerge) {
            throw notFoundOriginalFieldTypePolicyError;
          }

          if (!existing) return { ...incoming, args: options.args };

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const result = originalFieldMerge(existing, incoming, options, ...rest);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return { ...result, args: options.args };
        };

        const readFieldTypePolicy: FieldReadFunction = (existing, options, ...rest) => {
          const originalFieldRead = originalConnectionFieldTypePolicy.read;
          if (!originalFieldRead) {
            throw notFoundOriginalFieldTypePolicyError;
          }

          const { readField, fieldName, storeFieldName } = options;

          const connectionInfo: ConnectionInfo = {
            parent: {
              id: readField<string>('id') || ROOT_QUERY_KEY,
              typename: parent.typename,
            },
            connection: { fieldName, args: getArgsFromStoreFieldName({ storeFieldName }) || {} },
            edge: {
              typename: parent.edge.typename,
            },
          };
          const connectionId = generateConnectionId(connectionInfo);

          // Works even if user omits `edges` field
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const originalResult = originalFieldRead({ edges: [], ...existing }, options, ...rest);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            ...originalResult,
            __connectionId: connectionId,
          };
        };

        const typePolicy = {
          ...originalTypePolicy,
          fields: {
            ...originalTypePolicy.fields,
            [connectionFieldName]: {
              ...originalTypePolicy.fields[connectionFieldName],
              merge: mergeFieldTypePolicy,
              read: readFieldTypePolicy,
            },
          },
        };
        return [parent.typename, typePolicy];
      });
    })
    .flat();
};

export const generatePaginationNodeTypePolicyPairs = ({
  paginationMetaList,
  typePolicies,
}: {
  paginationMetaList: PaginationMeta[];
  typePolicies: TypePolicies;
}): [string, TypePolicy][] => {
  return paginationMetaList.map((metadata): TypePolicyPair => {
    return generateTypePolicyPairWithTypeMergeFunction({
      innerFunction: ({ mergedObject, options }) => insertNode({ object: mergedObject, options }),
      typename: metadata.node.typename,
      typePolicies,
    });
  });
};

const insertNode = ({ object, options }: { object: Reference; options: FieldFunctionOptions }): void => {
  const { cache, field, storeFieldName } = options;

  const connectionInfos = getConnectionInfos(storeFieldName);

  const directiveName = findDirectiveName({
    fieldOrSelection: field,
    directiveNames: INSERT_NODE_DIRECTIVE_NAMES,
  });
  if (!directiveName) return;

  connectionInfos.forEach((connectionInfo) => {
    cache.modify({
      id: cache.identify({ id: connectionInfo.parent.id, __typename: connectionInfo.parent.typename }),
      fields: {
        [connectionInfo.connection.fieldName]: (
          existingConnection: StoreObject & {
            edges: ReadonlyArray<{ node: { __ref: string } }>;
            args?: Record<string, unknown>;
          },
        ) => {
          if (
            existingConnection.args &&
            connectionInfo.connection.args &&
            !isMatch(existingConnection.args, connectionInfo.connection.args)
          ) {
            return { ...existingConnection };
          }
          if (existingConnection.edges.find((edge) => edge.node.__ref === object.__ref)) {
            return { ...existingConnection };
          }
          const newEdge = { __typename: connectionInfo.edge.typename, node: object, cursor: '' };
          const edges =
            directiveName === 'appendNode'
              ? [...existingConnection.edges, newEdge]
              : [newEdge, ...existingConnection.edges];
          return {
            ...existingConnection,
            edges,
          };
        },
      },
    });
  });
};

const getArgsFromStoreFieldName = ({
  storeFieldName,
}: {
  storeFieldName: FieldFunctionOptions['storeFieldName'];
}): Record<string, unknown> | undefined => {
  const argsStr = /:(?<args>\{.+\})/.exec(storeFieldName)?.groups?.args;
  if (!argsStr || argsStr.length === 0) return undefined;
  return JSON.parse(argsStr) as Record<string, unknown>;
};

const getConnectionInfos = (storeFieldName: FieldFunctionOptions['storeFieldName']): ConnectionInfo[] => {
  const connectionsStr = /"connections":(?<connections>\[[^\].]+\])/.exec(storeFieldName)?.groups?.connections;
  if (!connectionsStr) return [];
  const connections = JSON.parse(connectionsStr) as string[];
  return connections.map((connection) => JSON.parse(decode(connection)) as ConnectionInfo);
};

export const generateConnectionId = (params: ConnectionInfo): string => {
  return encode(JSON.stringify(params));
};
