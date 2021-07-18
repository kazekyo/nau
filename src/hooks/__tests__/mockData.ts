import { gql } from '@apollo/client';
import { backendIdGenerator } from '../../utils/testing/backendIdGenerator';

export type FragmentDataType = {
  id: string;
  __typename: 'Foo';
  bars: {
    edges: { node: { id: string; __typename: 'Bar' }; cursor: string }[];
    pageInfo: { hasNextPage?: boolean; hasPreviousPage?: boolean; endCursor?: string; startCursor?: string };
  };
};

export type QueryDataType = {
  foo: FragmentDataType;
};

export type PaginationQueryDataType = {
  node: FragmentDataType;
};

export const FORWARD_PAGINATION_FRAGMENT = gql`
  fragment ForwardPaginationFragment on Foo
  @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
  @refetchable(queryName: "PaginationQuery") {
    id
    bars(first: $count, after: $cursor) @paginatable {
      edges {
        node {
          id
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const BACKWARD_PAGINATION_FRAGMENT = gql`
  fragment BackwardPaginationFragment on Foo
  @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
  @refetchable(queryName: "PaginationQuery") {
    id
    bars(last: $count, before: $cursor) @paginatable {
      edges {
        node {
          id
        }
        cursor
      }
      pageInfo {
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const FORWARD_QUERY = gql`
  query Query {
    foo {
      id
      ...ForwardPaginationFragment
    }
  }
  ${FORWARD_PAGINATION_FRAGMENT}
`;

export const BACKWARD_QUERY = gql`
  query Query {
    foo {
      id
      ...BackwardPaginationFragment
    }
  }
  ${BACKWARD_PAGINATION_FRAGMENT}
`;

export const FORWARD_PAGINATION_QUERY = gql`
  query TemporaryPaginationQuery($id: ID!) {
    node(id: $id) {
      ...ForwardPaginationFragment
    }
  }
  ${FORWARD_PAGINATION_FRAGMENT}
`;

export const BACKWARD_PAGINATION_QUERY = gql`
  query TemporaryPaginationQuery($id: ID!) {
    node(id: $id) {
      ...BackwardPaginationFragment
    }
  }
  ${BACKWARD_PAGINATION_FRAGMENT}
`;

export const FOO_ID = backendIdGenerator({ typename: 'Foo', localId: '1' });
export const BAR_1_ID = backendIdGenerator({ typename: 'Bar', localId: '1' });
export const BAR_2_ID = backendIdGenerator({ typename: 'Bar', localId: '2' });

export const forwardQueryMockData: QueryDataType = {
  foo: {
    id: FOO_ID,
    __typename: 'Foo',
    bars: {
      edges: [{ node: { id: BAR_1_ID, __typename: 'Bar' }, cursor: 'cursor-1' }],
      pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
    },
  },
};
export const forwardPaginationQueryMockData: PaginationQueryDataType = {
  node: {
    id: FOO_ID,
    __typename: 'Foo',
    bars: {
      edges: [{ node: { id: BAR_2_ID, __typename: 'Bar' }, cursor: 'cursor-2' }],
      pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
    },
  },
};

export const backwardQueryMockData: QueryDataType = {
  foo: {
    id: FOO_ID,
    __typename: 'Foo',
    bars: {
      edges: [{ node: { id: BAR_2_ID, __typename: 'Bar' }, cursor: 'cursor-2' }],
      pageInfo: { hasPreviousPage: true, startCursor: 'cursor-2' },
    },
  },
};

export const backwardPaginationQueryMockData: PaginationQueryDataType = {
  node: {
    id: FOO_ID,
    __typename: 'Foo',
    bars: {
      edges: [{ node: { id: BAR_1_ID, __typename: 'Bar' }, cursor: 'cursor-1' }],
      pageInfo: { hasPreviousPage: false, startCursor: 'cursor-1' },
    },
  },
};
