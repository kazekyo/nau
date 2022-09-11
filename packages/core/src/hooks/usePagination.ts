import { DocumentNode, OperationVariables, TypedDocumentNode, useLazyQuery } from '@apollo/client';
import { getNodesFromConnection } from '../utils';

type LoadFunction = (count: number) => void;
type PageInfo = {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  endCursor?: string | null;
  startCursor?: string | null;
};
type Edge<TNode> = {
  node?: TNode | null;
};

export type UsePaginationOptions<TNode, TVariables> = {
  id: string;
  connection: {
    edges?: (Edge<TNode> | null | undefined)[] | null;
    pageInfo?: PageInfo;
  };
  variables?: TVariables;
};

export const usePagination = <TNode, TData = unknown, TVariables = OperationVariables>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables>,
  // If 'options' is undefined, it will always return empty nodes. It exists to prevent the use of conditions outside of this hook.
  //   https://en.reactjs.org/docs/hooks-rules.html#explanation
  options: UsePaginationOptions<TNode, TVariables> | undefined,
): {
  nodes: TNode[];
  loadNext: LoadFunction;
  loadPrevious: LoadFunction;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  refetch?: ReturnType<typeof useLazyQuery>['1']['refetch'];
} => {
  if (!options)
    return {
      nodes: [],
      loadNext: () => ({}),
      loadPrevious: () => ({}),
      hasNext: false,
      hasPrevious: false,
      isLoading: false,
    };

  const { id, connection } = options;

  const [call, { called, loading, fetchMore, refetch }] = useLazyQuery(document);

  const load = (count: number, cursor: string | undefined | null) => {
    if (!cursor) return;
    const allVariables = { id, count, cursor, ...(options.variables || {}) } as unknown;
    if (called && fetchMore) {
      void fetchMore({ variables: allVariables as TVariables });
    } else {
      void call({ variables: allVariables as TVariables, fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' });
    }
  };

  const loadNext: LoadFunction = (count) => load(count, connection?.pageInfo?.endCursor);
  const loadPrevious: LoadFunction = (count) => load(count, connection.pageInfo?.startCursor);

  const nodes = getNodesFromConnection({ connection });

  return {
    nodes,
    loadNext,
    loadPrevious,
    hasNext: connection.pageInfo?.hasNextPage || false,
    hasPrevious: connection.pageInfo?.hasPreviousPage || false,
    isLoading: loading,
    refetch,
  };
};
