import { gql, useMutation, useSubscription } from '@apollo/client';
import { AddIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Box, Center, Button } from '@chakra-ui/react';
import { generateConnectionId, getNodesFromConnection, usePaginationFragment } from '@kazekyo/nau';
import * as React from 'react';
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
      items(first: $count, after: $cursor, keyword: $keyword) @paginatable {
        edges {
          node {
            id
            ...ListItem_item
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      ...ListItem_user
    }
    ${ListItemFragments.user}
    ${ListItemFragments.item}
  `,
};

const ADD_ROBOT = gql`
  mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!, $edgeTypeName: String!) {
    addItem(input: $input) {
      item @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        id
        ...ListItem_item
      }
    }
  }
  ${ListItemFragments.item}
`;

const ROBOT_ADDED_SUBSCRIPTION = gql`
  subscription ItemAddedSubscription($connections: [String!]!, $edgeTypeName: String!) {
    itemAdded {
      item @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        id
        name
      }
    }
  }
`;

const ROBOT_REMOVED_SUBSCRIPTION = gql`
  subscription ItemAddedSubscription {
    itemRemoved {
      id @deleteRecord
    }
  }
`;

const Subscription: React.FC<{ userId: string }> = ({ userId }) => {
  const connectionId = generateConnectionId({ id: userId, field: 'items' });

  useSubscription(ROBOT_ADDED_SUBSCRIPTION, {
    variables: {
      connections: [connectionId],
      edgeTypeName: 'ItemEdge',
    },
  });

  useSubscription(ROBOT_REMOVED_SUBSCRIPTION);
  return <></>;
};

type ItemsType = { edges: { node: { id: string; name: string }; cursor: string }[] };
type ReturnType = { items: ItemsType };

const List: React.FC<{
  user: { id: string };
}> = ({ user }) => {
  const [addItem] = useMutation(ADD_ROBOT);
  const paginationData = usePaginationFragment<ReturnType>({
    id: user.id,
    fragment: ListFragments.user,
    fragmentName: 'List_user',
  });
  const { loadNext, hasNext, data, isLoadingNext } = paginationData;
  if (!data) return null;
  const { items } = data;

  const connectionId = generateConnectionId({ id: user.id, field: 'items' });
  const nodes = getNodesFromConnection({ connection: items });

  return (
    <>
      <Subscription userId={user.id} />
      <div>
        <Button
          leftIcon={<AddIcon />}
          onClick={() =>
            void addItem({
              variables: {
                input: { itemName: 'new item', userId: user.id },
                connections: [connectionId],
                edgeTypeName: 'ItemEdge',
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
