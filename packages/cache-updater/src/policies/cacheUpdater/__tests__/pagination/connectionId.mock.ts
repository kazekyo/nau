import { gql } from '@apollo/client';
import { userId } from './mock';

export type ConnectionIdOnlyQueryDataType = {
  items: { __connectionId: string };
  viewer: {
    id: string;
    __typename: 'User';
    items: { __connectionId: string };
  };
};

export const connectionIdOnlyQueryDocument = gql`
  query TestQuery($cursor: String) {
    items(first: 1, after: $cursor) {
      __connectionId @client
    }
    viewer {
      id
      __typename
      items(first: 1, after: $cursor) {
        __connectionId @client
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
