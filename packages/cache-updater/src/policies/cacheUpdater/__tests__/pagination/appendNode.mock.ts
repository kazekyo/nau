import { gql } from '@apollo/client';
import { generateConnectionId } from '../../pagination';
import { item11Id, item12Id, item21Id, userId } from './mock';

export const mutationDocument = gql`
  mutation AddItemMutation($itemName: String!, $userId: ID!, $connections: [String!]!) {
    addItem(input: { itemName: $itemName, userId: $userId }) {
      item @appendNode(connections: $connections) {
        id
        __typename
      }
    }
  }
`;

export const mutationMockData = { addItem: { item: { id: item11Id, __typename: 'Item' } } };

export const mutationVariables = {
  itemName: 'item11',
  userId: userId,
  connections: [
    generateConnectionId({
      parent: { id: userId, typename: 'User' },
      connection: { fieldName: 'items', args: {} },
      edge: { typename: 'ItemEdge' },
    }),
  ],
};

export const differentArgsMutationMockData1 = {
  addItem: { item: { id: item11Id, __typename: 'Item', name: 'Item11' } },
};

export const differentArgsMutationVariables1 = {
  itemName: 'item11',
  userId: userId,
  connections: [
    generateConnectionId({
      parent: { id: userId, typename: 'User' },
      connection: { fieldName: 'items', args: { search: '1' } },
      edge: { typename: 'ItemEdge' },
    }),
  ],
};

export const differentArgsMutationMockData2 = {
  addItem: { item: { id: item12Id, __typename: 'Item', name: 'Item12' } },
};

export const differentArgsMutationVariables2 = {
  itemName: 'item12',
  userId: userId,
  connections: [
    generateConnectionId({
      parent: { id: userId, typename: 'User' },
      connection: { fieldName: 'items', args: { search: '2' } },
      edge: { typename: 'ItemEdge' },
    }),
  ],
};

export const appendItemToRootMutationVariables = {
  itemName: 'item11',
  userId: userId,
  connections: [
    generateConnectionId({
      parent: { id: 'ROOT_QUERY', typename: 'Query' },
      connection: { fieldName: 'items', args: {} },
      edge: { typename: 'ItemEdge' },
    }),
  ],
};

export const subscriptionDocument = gql`
  subscription ItemAddedSubscription($connections: [String!]!) {
    itemAdded {
      item @appendNode(connections: $connections) {
        id
        __typename
      }
    }
  }
`;

export const subscriptionMockData = { itemAdded: { item: { id: item21Id, __typename: 'Item' } } };
