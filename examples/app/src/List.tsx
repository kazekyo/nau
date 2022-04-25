import { gql, useMutation, useSubscription } from '@apollo/client';
import { AddIcon } from '@chakra-ui/icons';
import { Box, Button } from '@chakra-ui/react';
import { usePagination } from '@nau/core';
import * as React from 'react';
import {
  AddItemMutationDocument,
  ItemAddedSubscriptionDocument,
  ItemRemovedSubscriptionDocument,
  List_PaginationQueryDocument,
  List_UserFragment,
} from './generated/graphql';
import ListItem, { ListItemFragments } from './ListItem';

export const ListFragments = {
  user: gql`
    fragment List_user on User
    @argumentDefinitions(
      count: { type: "Int", defaultValue: 2 }
      cursor: { type: "String" }
      keyword: { type: "String" }
    )
    @refetchable(queryName: "List_PaginationQuery") {
      items(first: $count, after: $cursor, keyword: $keyword) @pagination {
        edges {
          node {
            ...ListItem_item
          }
        }
      }
      ...ListItem_user
    }
    ${ListItemFragments.user}
    ${ListItemFragments.item}
  `,
};

gql`
  mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
    addItem(input: $input) {
      item @prependNode(connections: $connections) {
        id
        ...ListItem_item
      }
    }
  }
  ${ListItemFragments.item}
`;

gql`
  subscription ItemAddedSubscription($connections: [String!]!) {
    itemAdded {
      item @prependNode(connections: $connections) {
        id
        name
      }
    }
  }
`;

gql`
  subscription ItemRemovedSubscription {
    itemRemoved {
      id @deleteRecord(typename: "Item")
    }
  }
`;

const List: React.FC<{
  user: List_UserFragment;
}> = ({ user }) => {
  useSubscription(ItemAddedSubscriptionDocument, {
    variables: {
      connections: [user.items._connectionId],
    },
  });
  useSubscription(ItemRemovedSubscriptionDocument);
  const [addItem] = useMutation(AddItemMutationDocument);
  const { nodes, hasNext, loadNext, isLoading } = usePagination(List_PaginationQueryDocument, {
    id: user.id,
    connection: user.items,
  });

  return (
    <>
      <div>
        <Button
          leftIcon={<AddIcon />}
          onClick={() =>
            void addItem({
              variables: {
                input: { itemName: 'new item', userId: user.id },
                connections: [user.items._connectionId],
              },
            })
          }
        >
          Add Item
        </Button>
      </div>
      <div>
        {nodes.map((node, i) => {
          return (
            <Box mt="3" key={node.id}>
              <ListItem user={user} item={node} />
            </Box>
          );
        })}
      </div>
      {hasNext ? (
        <Button
          mt="3"
          colorScheme="teal"
          variant="outline"
          isLoading={isLoading}
          onClick={() => loadNext(2)}
          disabled={!hasNext}
        >
          Load more
        </Button>
      ) : null}
    </>
  );
};

export default List;
