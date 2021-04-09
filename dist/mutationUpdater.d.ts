import { ApolloLink, TypePolicy } from '@apollo/client';
declare type ConnectionInfo = {
    id: string;
    field: string;
    keyArgs?: Record<string, unknown>;
};
export declare const createMutationUpdaterLink: () => ApolloLink;
export declare const mutationUpdater: () => TypePolicy;
export declare const generateConnectionId: (connectionInfo: ConnectionInfo) => string;
export {};
