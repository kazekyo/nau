# @deleteRecord

Use the `@deleteRecord` directive to delete a item in the cache based on a mutation result.

You can put this directive on only a `id` field. The `typename` argument is the type of data to be deleted.

```graphql
mutation RemoveItemMutation($input: RemoveItemInput!) {
  removeItem(input: $input) {
    removedItem {
      id @deleteRecord(typename: "Item")
    }
  }
}
```

Using this directive will delete the data from the cache. So if you have the item in connections A and B, `@deleteRecord` will remove the data from both connections.
