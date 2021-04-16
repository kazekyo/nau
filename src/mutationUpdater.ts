/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ApolloCache,
  ApolloLink,
  FetchResult,
  FieldFunctionOptions,
  Observable,
  Reference,
  StoreObject,
  TypePolicy,
} from '@apollo/client';
import { DocumentNode, visit } from 'graphql/language';
import { decode, encode } from 'js-base64';
import isMatch from 'lodash.ismatch';

type ConnectionInfo = {
  id: string;
  field: string;
  keyArgs?: Record<string, unknown>;
};

const DIRECTIVE_NAMES = ['appendNode', 'prependNode', 'deleteRecord'];

const isQuery = (query: DocumentNode): boolean => {
  return query.definitions.some((element) => {
    return element.kind === 'OperationDefinition' && element.operation === 'query';
  });
};

export const isSubscription = (query: DocumentNode): boolean => {
  return query.definitions.some((element) => {
    return element.kind === 'OperationDefinition' && element.operation === 'subscription';
  });
};

const transform = (input: DocumentNode) => {
  let argumentNames: string[] = [];

  if (isQuery(input)) {
    return input;
  }

  visit(input, {
    Directive: {
      enter(node) {
        if (node.arguments !== undefined && node.arguments?.length > 0) {
          argumentNames = node.arguments.map((m) => m.name.value);
        }
      },
    },
  });

  return visit(input, {
    VariableDefinition: {
      enter(node) {
        if (argumentNames.includes(node.variable.name.value)) {
          return null;
        }
      },
    },
    Directive: {
      enter(node) {
        if (DIRECTIVE_NAMES.includes(node.name.value)) {
          return null;
        }
      },
    },
  });
};

export const createMutationUpdaterLink = (): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    operation.query = transform(operation.query);
    if (isSubscription(operation.query)) {
      return new Observable<FetchResult>((observer) =>
        forward(operation).subscribe((response) => observer.next(response)),
      );
    }

    if (!forward) return null;

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
  const connectionInfo = JSON.parse(decode(connectionId)) as ConnectionInfo;
  cache.modify({
    id: connectionInfo.id,
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

const nonNullable = <T>(value: T): value is NonNullable<T> => value != null;

export const mutationUpdater = (): TypePolicy => {
  return {
    merge(existing: Reference, incoming: Reference, { cache, field, storeFieldName }: FieldFunctionOptions) {
      const result = { ...existing, ...incoming };
      const directiveName = field?.directives?.find((directive) => DIRECTIVE_NAMES.includes(directive.name.value))?.name
        .value;
      if (!directiveName) return result;

      if (!incoming.__ref) {
        const fieldNames =
          field?.selectionSet?.selections
            .map((selection) => (selection.kind === 'Field' ? selection.name.value : null))
            .filter(nonNullable) || [];
        throw new Error(
          `Cache key such as id does not exist. The only fields that exist are [${fieldNames.join(
            ', ',
          )}]. Please add the cache key to Mutation/Subscription. Location: ${storeFieldName}`,
        );
      }

      if (directiveName == 'deleteRecord') {
        const cacheId = cache.identify(result);
        cache.evict({ id: cacheId });
      } else {
        const connectionsStr = /"connections":(?<connections>\[[^\].]+\])/.exec(storeFieldName)?.groups?.connections;
        const connections = connectionsStr && (JSON.parse(connectionsStr) as string[]);
        const edgeTypeName = /"edgeTypeName":[^"]*"(?<edgeTypeName>.+)"/.exec(storeFieldName)?.groups?.edgeTypeName;
        if (!connections || !edgeTypeName) return result;
        connections.forEach((connectionId) =>
          insertNode({ cache, nodeRef: incoming, connectionId, edgeTypeName, type: directiveName }),
        );
      }

      return result;
    },
  };
};

export const generateConnectionId = (connectionInfo: ConnectionInfo): string => encode(JSON.stringify(connectionInfo));
