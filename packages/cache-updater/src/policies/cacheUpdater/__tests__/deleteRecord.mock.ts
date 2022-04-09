import { gql } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import { backendNodeIdGenerator } from '../../../utils/testing/backendNodeIdGenerator';
import { withCacheUpdaterInternal } from '../withCacheUpdater';

type ItemsConnectionType = {
  __connectionId: string;
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

const deleteRecordMetaList = [{ parent: { typename: 'Item' }, fields: [{ fieldName: 'id', typename: 'Item' }] }];
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
      __connectionId @client
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
        __connectionId @client
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
  mutation DeleteItemMutation {
    deleteItem {
      item {
        id @deleteRecord(typename: "Item")
        __typename
      }
    }
  }
`;
export const mutationMockData = { deleteItem: { item: { id: item1Id, __typename: 'Item' } } };

export const subscriptionDocument = gql`
  subscription ItemDeletedSubscription($connections: [String!]!) {
    itemDeleted {
      item {
        id @deleteRecord(typename: "Item")
        __typename
      }
    }
  }
`;
export const subscriptionMockData = { itemDeleted: { item: { id: item1Id, __typename: 'Item' } } };

export const testTypePoliciesWithSpecificReturnType = withCacheUpdaterInternal({
  paginationMetaList,
  deleteRecordMetaList: [{ parent: { typename: 'DeletedItem' }, fields: [{ fieldName: 'id', typename: 'Item' }] }],
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
export const mutationMockDataWithSpecificReturnType = {
  deleteItem: { item: { id: item1Id, __typename: 'DeletedItem' } },
};
