import { gql } from '@apollo/client';
import { userId } from './mock';

export type ConnectionIdOnlyQueryDataType = {
  items: { _connectionId: string };
  viewer: {
    id: string;
    __typename: 'User';
    items: { _connectionId: string };
  };
};

export const connectionIdOnlyQueryDocument = gql`
  query TestQuery($cursor: String) {
    items(first: 1, after: $cursor) {
      _connectionId @client
    }
    viewer {
      id
      __typename
      items(first: 1, after: $cursor) {
        _connectionId @client
      }
    }
  }
`;

export const connectionIdOnlyQueryMockData = {
  items: {},
  viewer: {
    id: userId,
    __typename: 'User',
    items: {},
  },
};
