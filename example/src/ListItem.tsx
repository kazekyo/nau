import { gql, useMutation } from '@apollo/client';
import { Box, Button, Spacer } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import * as React from 'react';
import { FC } from 'react';

export const ListItemFragments = {
  user: gql`
    fragment ListItem_user on User {
      id
    }
  `,
  item: gql`
    fragment ListItem_item on Item {
      id
      name
    }
  `,
};

const REMOVE_ROBOT = gql`
  mutation RemoveItemMutation($input: RemoveItemInput!) {
    removeItem(input: $input) {
      item {
        id @deleteRecord
      }
    }
  }
`;

const ListItem: FC<{
  user: { id: string };
  item: { id: string; name: string };
}> = ({ user, item }) => {
  const [removeItem] = useMutation(REMOVE_ROBOT);

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
            onClick={() => removeItem({ variables: { input: { itemId: item.id, userId: user.id } } })}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ListItem;
