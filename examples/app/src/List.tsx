import { gql } from '@apollo/client';
import { AddIcon } from '@chakra-ui/icons';
import { Box, Button } from '@chakra-ui/react';
import { getNodesFromConnection } from '@nau/cache-updater';
import * as React from 'react';
import {
  List_UserFragment,
  useAddItemMutation,
  useItemAddedSubscription,
  useItemRemovedSubscription,
  useList_PaginationQueryLazyQuery,
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
      id
      items(first: $count, after: $cursor, keyword: $keyword) @pagination {
        edges {
          node {
            id
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

const Subscription: React.FC<{ connectionId: string }> = ({ connectionId }) => {
  useItemAddedSubscription({
    variables: {
      connections: [connectionId],
    },
  });
  useItemRemovedSubscription();
  return <></>;
};

const List: React.FC<{
  user: List_UserFragment;
}> = ({ user }) => {
  const [addItem] = useAddItemMutation();

  const [call, { loading, fetchMore }] = useList_PaginationQueryLazyQuery();

  if (!user.items) return null;

  // FIXME: replace
  const connectionId =
    'eyJwYXJlbnQiOnsiaWQiOiJWWE5sY2pveCIsInR5cGVuYW1lIjoiVXNlciJ9LCJjb25uZWN0aW9uIjp7ImZpZWxkTmFtZSI6Iml0ZW1zIiwiYXJncyI6e319LCJlZGdlIjp7InR5cGVuYW1lIjoiSXRlbUVkZ2UifX0=';

  const nodes = getNodesFromConnection({ connection: user.items });
  const hasNext = user.items.pageInfo.hasNextPage;
  const cursor = user.items.pageInfo.endCursor;
  const isLoadingNext = loading;
  const loadNext = (count: number) => {
    if (fetchMore) {
      fetchMore({ variables: { id: user.id, count, cursor } });
    } else {
      call({ variables: { id: user.id, count, cursor } });
    }
  };

  return (
    <>
      <Subscription connectionId={connectionId} />
      <div>
        <Button
          leftIcon={<AddIcon />}
          onClick={() =>
            void addItem({
              variables: {
                input: { itemName: 'new item', userId: user.id },
                connections: [connectionId],
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
          isLoading={isLoadingNext}
          onClick={() => loadNext(1)}
          disabled={!hasNext}
        >
          Load more
        </Button>
      ) : null}
    </>
  );
};

export default List;
