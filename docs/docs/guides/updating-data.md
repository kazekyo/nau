---
sidebar_position: 2
---

#  Updating Data

If you want to add or remove an element from a list, you can easily implement it with some directives.

## Adding Data
`@prependNode` adds a element to the top of a list, and  `@appendNode` adds a element to the bottom of a list.

```graphql
mutation AddItemMutation($input: AddItemInput!, $connections: [String!!) {
  addItem(input: $input) {
    item @prependNode(connections: $connections) {
      name
    }
  }
}
```

And you must have attached `@pagination` to the connection field for the following.
```graphql
fragment List_user on User {
  id
  items(first: $count, after: $cursor) @pagination {
    edges {
      node {
        name
      }
    }
  }
}
```
If you attached `@pagination`, Nau will generate a `_connectionId`. You must specify this `_connectionId` to the `connections` argument of `@prependNode` in order for Nau to guess which connection to add the element to.

Run `yarn graphql-codegen` to generate documents and use `_connectionId`.

```tsx title="src/List.tsx"
const List: React.FC<{ user: List_UserFragment }> = ({ user }) => {
  // ...
  const [addItem] = useMutation(AddItemMutationDocument);
  // ...
  return (
    <>
      <Button
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
      {/*...*/}
    </>
  )
}
```

## Removing data
You can also delete data. `@deleteRecord` removes data from the cache based on the id contained in a mutation result. It will also automatically remove edges associated with the data from all connections to which `@pagionation` is attached.

```graphql
mutation RemoveItemMutation($input: RemoveItemInput!) {
  removeItem(input: $input) {
    removedItem {
      id @deleteRecord(typename: "Item")
    }
  }
}
```
You have to attach the `@deleteRecord` directive only, and no other work is required. Nau will automatically manipulate the cache based on the mutation result.


## Subscription
`@appendNode`/`@appendNode` and `@deleteRecord` also work the same with Subscription as they do with Mutation.

```graphql
subscription ItemAddedSubscription($connections: [String!]!) {
  itemAdded {
    item @prependNode(connections: $connections) {
      ...ListItem_item
    }
  }
}
subscription ItemRemovedSubscription {
  itemRemoved {
    id @deleteRecord(typename: "Item")
  }
}
```
