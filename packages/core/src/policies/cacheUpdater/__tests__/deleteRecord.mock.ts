import { gql } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { backendNodeIdGenerator } from '../../../utils/testing/backendNodeIdGenerator';
import { withCacheUpdaterInternal } from '../withCacheUpdater';

type ItemsConnectionType = {
  _connectionId: string;
  edges: { node: { id: string; __typename: 'Item' }; cursor: string }[];
  pageInfo: { hasNextPage?: boolean; hasPreviousPage?: boolean; endCursor?: string; startCursor?: string };
};

export type QueryDataType = {
  items1: ItemsConnectionType;
  viewer: {
    id: string;
    __typename: 'User';
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

const deleteRecordMetaList = [
  { parent: { typename: 'RemovedItem' }, fields: [{ fieldName: 'id', typename: 'Item' }] },
  { parent: { typename: 'ItemRemovedPayload' }, fields: [{ fieldName: 'id', typename: 'Item' }] },
];
export const testTypePolicies = withCacheUpdaterInternal({
  paginationMetaList,
  deleteRecordMetaList,
  typePolicies: {
    Query: {
      fields: {
        items: relayStylePagination(),
      },
    },
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

export const queryDocument = gql`
  query TestQuery($cursor1: String, $cursor2: String) {
    items1: items(first: 1, after: $cursor1) {
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
      items2: items(first: 2, after: $cursor2) {
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
  items1: {
    edges: [{ node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' }],
    pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
  },
  viewer: {
    id: userId,
    __typename: 'User',
    items2: {
      edges: [
        { node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' },
        { node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' },
      ],
      pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
    },
  },
};

export const mutationDocument = gql`
  mutation DeleteItemMutation($input: RemoveItemInput!) {
    removeItem(input: $input) {
      removedItem {
        id @deleteRecord(typename: "Item")
        __typename
      }
    }
  }
`;
export const mutationVariables = {
  input: {
    itemId: item1Id,
    userId: userId,
  },
};
export const mutationMockData = { removeItem: { removedItem: { id: item1Id, __typename: 'RemovedItem' } } };

export const subscriptionDocument = gql`
  subscription ItemDeletedSubscription($connections: [String!]!) {
    itemRemoved {
      id @deleteRecord(typename: "Item")
      __typename
    }
  }
`;
export const subscriptionMockData = { itemRemoved: { id: item1Id, __typename: 'ItemRemovedPayload' } };
