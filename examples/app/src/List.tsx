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
      id # TODO : Add automatically
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

type LoadNext = (count: number) => void;
type PageInfo = {
  hasNextPage: boolean;
  endCursor?: string | null;
};
const usePagination = ({
  id,
  connection,
}: {
  id: string;
  connection: { pageInfo: PageInfo };
}): { hasNext: boolean; isLoadingNext: boolean; loadNext: LoadNext } => {
  const [call, { loading, fetchMore }] = useList_PaginationQueryLazyQuery();

  const hasNext = connection.pageInfo.hasNextPage;
  const cursor = connection.pageInfo.endCursor || undefined;
  const isLoadingNext = loading;
  const loadNext = (count: number) => {
    if (fetchMore) {
      fetchMore({ variables: { id, count, cursor } });
    } else {
      call({ variables: { id, count, cursor } });
    }
  };

  return { hasNext, isLoadingNext, loadNext };
};

const List: React.FC<{
  user: List_UserFragment;
}> = ({ user }) => {
  const [addItem] = useAddItemMutation();
  useItemAddedSubscription({
    variables: {
      connections: [user.items._connectionId],
    },
  });
  useItemRemovedSubscription();
  const { hasNext, isLoadingNext, loadNext } = usePagination({ id: user.id, connection: user.items });

  const nodes = getNodesFromConnection({ connection: user.items });

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
