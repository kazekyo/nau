import { gql } from '@apollo/client';

const myFragment = gql`
  fragment MyFragment_user on User
  @refetchable(queryName: "App_PaginationQuery")
  @argumentDefinitions(count: { type: "Int", defaultValue: 5 }, cursor: { type: "String" }) {
    name
    items(first: $count, after: $cursor) @pagination {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

gql`
  query MyAppQuery {
    viewer {
      id
      ...MyFragment_user @arguments(count: 5)
    }
  }
  ${myFragment}
`;

gql`
  mutation DeleteItemMutation($input: RemoveItemInput!) {
    removeItem(input: $input) {
      removedItem {
        id @deleteRecord(typename: "Item")
        __typename
      }
    }
  }
`;

gql`
  subscription ItemDeletedSubscription($connections: [String!]!) {
    itemRemoved {
      id @deleteRecord(typename: "Item")
      __typename
    }
  }
`;
