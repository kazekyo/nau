/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApolloCache, ApolloLink, FetchResult, Observable, StoreObject } from '@apollo/client';
import { DocumentNode, visit } from 'graphql/language';
import { decode, encode } from 'js-base64';
import isMatch from 'lodash.ismatch';
import _ from 'lodash';

let directivePath: string[] = [];
let connections: string[] = [];
let edgeTypeName: string;
let directiveName: string;

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

export const isArray = (a: any): boolean => {
  return !!a && a.constructor === Array;
};

const transform = (input: DocumentNode, variables: Record<string, any>) => {
  let argumentNames: string[] = [];
  let argConnNames: string[] = [];
  let argEdgeNames: string[] = [];

  if (isQuery(input)) {
    return input;
  }

  visit(input, {
    Directive: {
      enter(node) {
        if (node.arguments !== undefined && node.arguments?.length > 0) {
          argumentNames = _.map(node.arguments, (m) => m.name.value);
          argConnNames = _.map(node.arguments, (m) =>
            m.value.kind === 'Variable' && m.name.value === 'connections'
              ? m.value.name.value
              : m.value.kind === 'StringValue' && m.name.value === 'connections'
              ? m.name.value
              : '',
          );
          argEdgeNames = _.map(node.arguments, (m) =>
            m.value.kind === 'Variable' && m.name.value === 'edgeTypeName'
              ? m.value.name.value
              : m.value.kind === 'StringValue' && m.name.value === 'edgeTypeName'
              ? m.name.value
              : '',
          );
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
      enter(node, key, parent, path, ancestors) {
        if (DIRECTIVE_NAMES.includes(node.name.value)) {
          if (
            (node.name.value === 'appendNode' || node.name.value === 'prependNode') &&
            node.arguments !== undefined &&
            node.arguments?.length > 0
          ) {
            directiveName = node.name.value;
            connections = [];
            if (argConnNames.length > 0) {
              argConnNames.forEach((argConnName) => {
                if (_.has(variables, argConnName)) {
                  connections = variables[argConnName];
                }
              });
            }
            edgeTypeName = '';
            if (argEdgeNames.length > 0) {
              argEdgeNames.forEach((argEdgeName) => {
                if (_.has(variables, argEdgeName)) {
                  edgeTypeName = variables[argEdgeName];
                }
              });
            }
          } else {
            directiveName = '';
            edgeTypeName = '';
            connections = [];
          }

          directivePath = [];
          ancestors.filter((ancestor) => {
            if (isArray(ancestor)) {
              Object.values(ancestor).forEach((element) => {
                if (element.name.value !== '__typename' && element.kind === 'Field') {
                  directivePath.push(element.name.value);
                }
              });
            }
          });

          return null;
        }
      },
    },
  });
};

export const createMutationUpdaterLink = (cache: any, fieldName: string): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    operation.query = transform(operation.query, operation.variables);
    if (isSubscription(operation.query)) {
      return new Observable<FetchResult>((observer) =>
        forward(operation).subscribe((response) => {
          observer.next(response);
        }),
      );
    }

    if (!forward) return null;

    return forward(operation).map(({ data, ...response }) => {
      console.log('directivePath ', directivePath);
      const directivePathString = _.join(directivePath, '.');
      if (_.has(data, directivePathString) && edgeTypeName && directiveName && connections.length > 0) {
        console.log('INSERT ');
        connections.forEach((connectionId) => {
          insertNode({
            cache,
            nodeRef: _.get(data, directivePathString),
            connectionId,
            edgeTypeName,
            type: directiveName,
            fieldName: fieldName,
          });
        });
      } else if (_.has(data, directivePathString)) {
        console.log('DELETE ');
        console.log('directivePathString ', directivePathString);
        const cacheId = cache.identify(_.get(data, directivePathString));
        console.log('cacheId ', cacheId);
        cache.evict({ id: cacheId });
      }
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
  fieldName,
}: {
  cache: ApolloCache<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeRef: any;
  connectionId: string;
  edgeTypeName: string;
  type: string;
  fieldName: string;
}) => {
  const connectionInfo = JSON.parse(decode(connectionId)) as ConnectionInfo;
  cache.modify({
    id: connectionInfo.id,
    fields: {
      [connectionInfo.field]: (
        existingConnection: StoreObject & {
          edges: ReadonlyArray<{ node: { __ref?: string; id?: string } }>;
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
        const property = nodeRef['__ref'] !== undefined ? '__ref' : fieldName;
        if (
          existingConnection.edges.find(
            (edge) => edge.node.__ref === nodeRef[property] || edge.node.id === nodeRef[property],
          )
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

/*
export const mutationUpdater = (): TypePolicy => {
  return {
    merge(existing: Reference, incoming: Reference, { cache, field, storeFieldName }) {
      const result = { ...existing, ...incoming };
      const directiveName = field?.directives?.find((directive) => DIRECTIVE_NAMES.includes(directive.name.value))?.name
        .value;
      if (!directiveName) return result;
      
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
*/

export const generateConnectionId = (connectionInfo: ConnectionInfo): string => encode(JSON.stringify(connectionInfo));
