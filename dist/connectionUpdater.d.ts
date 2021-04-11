import { ApolloCache, DocumentNode, Reference, StoreObject } from '@apollo/client';
declare type ConnectionInfo = {
    object?: Reference | StoreObject;
    field: string;
    keyArgs?: Record<string, unknown>;
};
declare type InsertNodeArgs<TData> = {
    node: Reference | StoreObject;
    fragment: DocumentNode;
    edgeTypename?: string;
    connectionInfo: ConnectionInfo;
    cache: ApolloCache<TData>;
    type?: 'prepend' | 'append';
};
export declare type DeleteNodeArgs<TData> = {
    node: Reference | StoreObject;
    connectionInfo: ConnectionInfo;
    cache: ApolloCache<TData>;
};
export declare type PrependNodeArgs<TData> = Omit<InsertNodeArgs<TData>, 'type'>;
export declare type AppendNodeArgs<TData> = Omit<InsertNodeArgs<TData>, 'type'>;
export declare const prependNode: <T>(args: Pick<InsertNodeArgs<T>, "node" | "fragment" | "edgeTypename" | "connectionInfo" | "cache">) => void;
export declare const appendNode: <T>(args: Pick<InsertNodeArgs<T>, "node" | "fragment" | "edgeTypename" | "connectionInfo" | "cache">) => void;
export declare const deleteNode: <T>({ node, connectionInfo, cache }: DeleteNodeArgs<T>) => void;
export {};
