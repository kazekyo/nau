/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApolloCache, DocumentNode, Reference, StoreObject } from '@apollo/client';
import isMatch from 'lodash/isMatch';

type ConnectionInfo = {
  object?: Reference | StoreObject;
  field: string;
  keyArgs?: Record<string, unknown>;
};

type InsertNodeArgs<TData> = {
  node: Reference | StoreObject;
  fragment: DocumentNode;
  edgeTypename?: string;
  connectionInfo: ConnectionInfo;
  cache: ApolloCache<TData>;
  type?: 'prepend' | 'append';
};

export type DeleteNodeArgs<TData> = {
  node: Reference | StoreObject;
  connectionInfo: ConnectionInfo;
  cache: ApolloCache<TData>;
};

export type PrependNodeArgs<TData> = Omit<InsertNodeArgs<TData>, 'type'>;

export type AppendNodeArgs<TData> = Omit<InsertNodeArgs<TData>, 'type'>;

const insertNode = <T>({ node, fragment, connectionInfo, cache, edgeTypename, type }: InsertNodeArgs<T>): void => {
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
        const newNodeRef = cache.writeFragment({
          id: cache.identify(node),
          data: node,
          fragment: fragment,
        });
        const cursor = `temp:${cache.identify(node)}`;
        const newEdge = { __typename: edgeTypename, node: newNodeRef, cursor };
        const edges =
          type === 'append' ? [...existingConnection.edges, newEdge] : [newEdge, ...existingConnection.edges];
        return {
          ...existingConnection,
          edges,
        };
      },
    },
  });
};

export const prependNode = <T>(args: PrependNodeArgs<T>): void => insertNode({ ...args, type: 'prepend' });

export const appendNode = <T>(args: AppendNodeArgs<T>): void => insertNode({ ...args, type: 'append' });

export const deleteNode = <T>({ node, connectionInfo, cache }: DeleteNodeArgs<T>): void => {
  cache.modify({
    id: connectionInfo.object && cache.identify(connectionInfo.object),
    fields: {
      [connectionInfo.field]: (
        existingConnection: StoreObject & {
          edges: Array<StoreObject & { node: Reference }>;
          args?: Record<string, unknown>;
        },
      ) => {
        const cacheId = cache.identify(node);
        const edges = existingConnection.edges.filter((edge) => cache.identify(edge.node) !== cacheId);
        return {
          ...existingConnection,
          edges,
        };
      },
    },
  });
};
