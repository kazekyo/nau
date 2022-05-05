---
sidebar_position: 2
---

#  Updating Data

Nau can automatically add objects to a list (connection) on cache based on mutation results. Using directives such as @appendNode will automatically add a element to a connection on the cache based on mutation results.

Let's look at an example mutation.
```graphql
mutation AddItemMutation($input: AddItemInput!) {
  addItem(input: $input) {
    item {
      name
    }
  }
}
```

Attach @prependNode to the `item` field. Using `@prependNode` you can add the element to the top of the list.

```graphql
// highlight-next-line
mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
  // highlight-next-line
  addItem(input: $input) @prependNode(connections: $connections) {
    item {
      name
    }
  }
}
```

Run `graphql-codegen`.
```bash
yarn graphql-codegen
```

Let's try to use this mutation.

```tsx title="src/List.tsx"
import {
  // highlight-next-line
  AddItemMutationDocument,
  List_PaginationQueryDocument,
  List_UserFragment,
} from './generated/graphql';

gql` /* GraphQL */
  fragment List_user on User
  @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
  @refetchable(queryName: "List_PaginationQuery") {
    id
    items(first: $count, after: $cursor) @pagination {
      edges {
        node {
          name
        }
      }
    }
  }

  // highlight-start
  mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
    addItem(input: $input) {
      item @prependNode(connections: $connections) {
        name
      }
    }
  }
  // highlight-end
`;

const List: React.FC<{ user: List_UserFragment }> = ({ user }) => {
  // ...

  // highlight-next-line
  const [addItem] = useMutation(AddItemMutationDocument);

  return (
    <>
      {/* ... */}
      <Button
        onClick={() =>
          // highlight-start
          void addItem({
            variables: {
              input: { itemName: 'new item', userId: user.id },
              connections: [user.items._connectionId],
            },
          })
          // highlight-end
        }
      >
        Add Item
      </Button>
      {/* ... */}
    </>
  );
};
```

Now you can add the element to the top of the list based on the mutation result.

Using [`@appendNode`](/docs/directives/appendNode-prependNode), you can do the opposite, adding the element to the bottom of the list. Other directives such as [`@deleteRecord`](/docs/directives/deleteRecord) delete data based on mutation results.
