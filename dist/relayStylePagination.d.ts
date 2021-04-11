import { FieldPolicy, Reference } from '@apollo/client/cache';
declare type KeyArgs = FieldPolicy<any>['keyArgs'];
export declare type TRelayEdge<TNode> = {
    cursor?: string;
    node: TNode;
} | (Reference & {
    cursor?: string;
});
export declare type TRelayPageInfo = {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
};
export declare type TExistingRelay<TNode> = Readonly<{
    edges: TRelayEdge<TNode>[];
    pageInfo: TRelayPageInfo;
}>;
export declare type TIncomingRelay<TNode> = {
    edges?: TRelayEdge<TNode>[];
    pageInfo?: TRelayPageInfo;
};
export declare type RelayFieldPolicy<TNode> = FieldPolicy<TExistingRelay<TNode>, TIncomingRelay<TNode>, TIncomingRelay<TNode>>;
export declare function relayStylePagination<TNode extends Reference>(keyArgs?: KeyArgs): RelayFieldPolicy<TNode>;
export {};
