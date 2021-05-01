/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ApolloCache,
  ApolloLink,
  FetchResult,
  gql,
  InMemoryCache,
  Observable,
  Reference,
  StoreObject,
} from '@apollo/client';
import { DocumentNode, FragmentDefinitionNode, print, SelectionSetNode, visit } from 'graphql/language';
import { decode, encode } from 'js-base64';
import _ from 'lodash';
import isMatch from 'lodash.ismatch';

// TODO : 戻り値にしたい
let directivePath: string[] = [];
let connections: string[] = [];
let edgeTypeName: string;
let directiveName: string;
let fragmentSelectionSet: SelectionSetNode | undefined;
let fragmentDefinitions: FragmentDefinitionNode[] = [];
let deleteCacheId: string | undefined = undefined;

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

// TODO : typeのチェックがゆるいので別の方法を使う
export const isArray = (a: any): boolean => {
  return !!a && a.constructor === Array;
};

const transform = (input: DocumentNode, variables: Record<string, any>) => {
  let argumentNames: string[] = [];
  let argConnNames: string[] = [];
  let argEdgeNames: string[] = [];
  fragmentSelectionSet = undefined;

  if (isQuery(input)) {
    return input;
  }

  visit(input, {
    Directive: {
      enter(node) {
        if (node.arguments !== undefined && node.arguments?.length > 0) {
          argumentNames = _.map(node.arguments, (m) => m.name.value);
          // TODO : なぜ複数形になってしまうのか確認する
          argConnNames = _.map(node.arguments, (m) =>
            m.value.kind === 'Variable' && m.name.value === 'connections'
              ? m.value.name.value
              : m.value.kind === 'StringValue' && m.name.value === 'connections'
              ? m.name.value
              : '',
          );
          // TODO : なぜ複数形になってしまうのか確認する
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
            const directiveNode = ancestors[ancestors.length - 1];
            if (directiveNode && 'selectionSet' in directiveNode && directiveNode.selectionSet) {
              fragmentSelectionSet = directiveNode.selectionSet;
              fragmentDefinitions = input.definitions.filter(
                (value): value is FragmentDefinitionNode => value.kind === 'FragmentDefinition',
              );
            }
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
                // TODO : よりスマートに書きたい
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

// TODO : operationのgetContextしたらcacheがあるのでそれ使えば良かった
export const createMutationUpdaterLink = (cache: InMemoryCache, fieldName: string): ApolloLink => {
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

    // TODO : setIdAsCacheするのではなく、idを一度戻してtypenameを取り出した後にapolloのidを特定したほうが良さそう
    return forward(operation).map(({ data, ...response }) => {
      const directivePathString = _.join(directivePath, '.');
      if (_.has(data, directivePathString) && edgeTypeName && directiveName && connections.length > 0) {
        connections.forEach((connectionId) => {
          const node = _.get(data, directivePathString);
          // TODO : addTypenameしてなかったら動かないとコメントで書いておく
          // console.log(node);
          if (!fragmentSelectionSet) return;
          const mainFragment: FragmentDefinitionNode = {
            directives: [],
            kind: 'FragmentDefinition',
            name: { kind: 'Name', value: 'MutationUpdaterWriteFragment' },
            selectionSet: fragmentSelectionSet,
            typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: node.__typename } },
          };
          const document = gql`
            ${print(mainFragment)}
            ${fragmentDefinitions.map((definiton) => print(definiton))}
          `;
          // console.log(print(document));
          const nodeRef = cache.writeFragment({
            id: node.id,
            data: node,
            fragment: document,
            fragmentName: 'MutationUpdaterWriteFragment',
          });
          if (!nodeRef) return;
          insertNode({
            cache,
            nodeRef: nodeRef,
            connectionId,
            edgeTypeName,
            type: directiveName,
          });
        });
      } else if (_.has(data, directivePathString)) {
        // TODO : これがオブジェクトではなくちゃんとidを指していないと、deletedIdなどの名前のfieldに対応できない
        const cacheId = cache.identify(_.get(data, directivePathString));
        cache.evict({ id: cacheId });
      }
      return { ...response, data };
    });
  });
};

// TODO : refだけを使用するように戻す
const insertNode = <T>({
  cache,
  nodeRef,
  connectionId,
  edgeTypeName,
  type,
}: {
  cache: ApolloCache<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const generateConnectionId = (connectionInfo: ConnectionInfo): string => encode(JSON.stringify(connectionInfo));
