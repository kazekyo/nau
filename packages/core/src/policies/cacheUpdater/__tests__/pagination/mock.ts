import { gql } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { backendNodeIdGenerator } from '../../../../utils/testing/backendNodeIdGenerator';
import { withCacheUpdaterInternal } from '../../withCacheUpdater';

type ItemsConnectionType = {
  _connectionId: string;
  edges: { node: { id: string; __typename: 'Item' }; cursor: string }[];
  pageInfo: { hasNextPage?: boolean; hasPreviousPage?: boolean; endCursor?: string; startCursor?: string };
};

export type QueryDataType = {
  items: ItemsConnectionType;
  viewer: {
    id: string;
    __typename: 'User';
    myItems: ItemsConnectionType;
  };
};

export type DifferentArgsConnectionsQueryDataType = {
  viewer: {
    id: string;
    __typename: 'User';
    items1: ItemsConnectionType;
    items2: ItemsConnectionType;
  };
};

const paginationMetaList = [
  {
    node: {
      typename: 'Item',
    },
    parents: [
      {
        typename: 'Query',
        connection: {
          fieldName: 'items',
        },
        edge: {
          typename: 'ItemEdge',
        },
      },
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
    Query: {
      fields: {
        items: relayStylePagination(),
      },
    },
    User: {
      fields: {
        items: relayStylePagination(['search']),
      },
    },
  },
});

export const userId = backendNodeIdGenerator({ typename: 'User', localId: '1' });
// Use query
export const item1Id = backendNodeIdGenerator({ typename: 'Item', localId: '1' });
export const item2Id = backendNodeIdGenerator({ typename: 'Item', localId: '2' });
// Use mutation
export const item11Id = backendNodeIdGenerator({ typename: 'Item', localId: '11' });
export const item12Id = backendNodeIdGenerator({ typename: 'Item', localId: '12' });
// Use subscription
export const item21Id = backendNodeIdGenerator({ typename: 'Item', localId: '21' });

export const queryDocument = gql`
  query TestQuery($cursor: String) {
    items {
      _connectionId @client
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
    viewer {
      id
      __typename
      myItems: items(first: 1, after: $cursor, search: "item") {
        _connectionId @client
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

export const queryMockData = {
  items: {
    edges: [{ node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' }],
    pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
  },
  viewer: {
    id: userId,
    __typename: 'User',
    myItems: {
      edges: [{ node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' }],
      pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
    },
  },
};

export const differentArgsConnectionsQueryDocument = gql`
  query TestQuery($cursor: String) {
    viewer {
      id
      __typename
      items1: items(first: 1, after: $cursor, search: "1") {
        _connectionId @client
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
      items2: items(first: 1, after: $cursor, search: "2") {
        _connectionId @client
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
export const differentArgsConnectionsQueryMockData = {
  viewer: {
    id: userId,
    __typename: 'User',
    items1: {
      edges: [{ node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' }],
      pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
    },
    items2: {
      edges: [{ node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' }],
      pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
    },
  },
};

export const prependItemMutationDocument = gql`
  mutation AddItemMutation($itemName: String!, $userId: ID!, $connections: [String!]!) {
    addItem(input: { itemName: $itemName, userId: $userId }) {
      item @prependNode(connections: $connections) {
        id
        __typename
      }
    }
  }
`;
export const prependItemMutationMockData = { addItem: { item: { id: item11Id, __typename: 'Item' } } };
