import { gql } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { withCacheUpdaterInternal } from '../../policies';
import { backendNodeIdGenerator } from '../../utils/testing/backendNodeIdGenerator';

type ItemsConnectionType = {
  _connectionId: string;
  edges: { node: { id: string; __typename: 'Item' }; cursor: string }[];
  pageInfo: { hasNextPage?: boolean; hasPreviousPage?: boolean; endCursor?: string; startCursor?: string };
};

export type QueryDataType = {
  viewer: {
    id: string;
    __typename: 'User';
    items: ItemsConnectionType;
  };
};

export type PaginationQueryDataType = {
  node: {
    id: string;
    __typename: 'User';
    items: ItemsConnectionType;
  };
};

const paginationMetaList = [
  {
    node: {
      typename: 'Item',
    },
    parents: [
      {
        typename: 'User',
        connection: {
          fieldName: 'items',
        },
        edge: {
          typename: 'ItemEdge',
        },
      },
    ],
  },
];

export const testTypePolicies = withCacheUpdaterInternal({
  paginationMetaList,
  deleteRecordMetaList: [],
  typePolicies: {
    User: {
      fields: {
        items: relayStylePagination(),
      },
    },
  },
});

export const userId = backendNodeIdGenerator({ typename: 'User', localId: '1' });
export const item1Id = backendNodeIdGenerator({ typename: 'Item', localId: '1' });
export const item2Id = backendNodeIdGenerator({ typename: 'Item', localId: '2' });
export const item3Id = backendNodeIdGenerator({ typename: 'Item', localId: '3' });

export const forwardQueryDocument = gql`
  query TestQuery {
    viewer {
      id
      __typename
      items(first: 1) {
        edges {
          node {
            id
            __typename
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const forwardQueryMockData = {
  viewer: {
    id: userId,
    __typename: 'User',
    items: {
      edges: [{ node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' }],
      pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
    },
  },
};

export const forwardPaginationQueryDocument = gql`
  query TestQuery($id: String, $count: Int, $cursor: String) {
    node(id: $id) {
      id
      __typename
      items(first: $count, after: $cursor) {
        edges {
          node {
            id
            __typename
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const forwardPaginationQueryMockData = {
  node: {
    id: userId,
    __typename: 'User',
    items: {
      edges: [
        { node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' },
        { node: { id: item3Id, __typename: 'Item' }, cursor: 'cursor-3' },
      ],
      pageInfo: { hasNextPage: false, endCursor: 'cursor-3' },
    },
  },
};

export const backwardQueryDocument = gql`
  query TestQuery {
    viewer {
      id
      __typename
      items(first: 1) {
        edges {
          node {
            id
            __typename
          }
          cursor
        }
        pageInfo {
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;

export const backwardQueryMockData = {
  viewer: {
    id: userId,
    __typename: 'User',
    items: {
      edges: [{ node: { id: item3Id, __typename: 'Item' }, cursor: 'cursor-3' }],
      pageInfo: { hasPreviousPage: true, startCursor: 'cursor-3' },
    },
  },
};

export const backwardPaginationQueryDocument = gql`
  query TestQuery($id: String, $count: Int, $cursor: String) {
    node(id: $id) {
      id
      __typename
      items(last: $count, before: $cursor) {
        edges {
          node {
            id
            __typename
          }
          cursor
        }
        pageInfo {
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;

export const backwardPaginationQueryMockData = {
  node: {
    id: userId,
    __typename: 'User',
    items: {
      edges: [
        { node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' },
        { node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' },
      ],
      pageInfo: { hasPreviousPage: false, startCursor: 'cursor-1' },
    },
  },
};

export const queryWithKeywordDocument = gql`
  query TestQuery($keyword: String!) {
    viewer {
      id
      __typename
      items(first: 1, keyword: $keyword) {
        edges {
          node {
            id
            __typename
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const queryWithKeywordMockData = forwardQueryMockData;

export const paginationQueryWithKeywordDocument = gql`
  query TestQuery($id: String, $count: Int, $cursor: String, $keyword: String!) {
    node(id: $id) {
      id
      __typename
      items(first: $count, after: $cursor, keyword: $keyword) {
        edges {
          node {
            id
            __typename
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const paginationQueryWithKeywordMockData = forwardPaginationQueryMockData;
