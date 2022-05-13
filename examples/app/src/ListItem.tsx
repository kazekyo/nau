import { gql, useMutation } from '@apollo/client';
import { DeleteIcon } from '@chakra-ui/icons';
import { Box, Button, Spacer } from '@chakra-ui/react';
import * as React from 'react';
import { FC } from 'react';
import { ListItem_ItemFragment, ListItem_UserFragment, RemoveItemMutationDocument } from './generated/graphql';

gql`
  fragment ListItem_user on User {
    id
  }

  fragment ListItem_item on Item {
    id
    name
  }

  mutation RemoveItemMutation($input: RemoveItemInput!) {
    removeItem(input: $input) {
      removedItem {
        id @deleteRecord(typename: "Item")
      }
    }
  }
`;

const ListItem: FC<{
  user: ListItem_UserFragment;
  item: ListItem_ItemFragment;
}> = ({ user, item }) => {
  const [removeItem] = useMutation(RemoveItemMutationDocument);

  return (
    <Box maxW="md" borderWidth="1px" borderRadius="lg">
      <Box p="3">
        <Box d="flex" alignItems="center">
          <Box fontWeight="semibold" fontSize="md">
            {item.name}
          </Box>
          <Box ml="4" color="gray.500" fontWeight="semibold" fontSize="sm">
            Item ID: {item.id}
          </Box>
          <Spacer />
          <Button
            ml="2"
            leftIcon={<DeleteIcon />}
            aria-label="Delete"
            colorScheme="red"
            onClick={() => void removeItem({ variables: { input: { itemId: item.id, userId: user.id } } })}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ListItem;
