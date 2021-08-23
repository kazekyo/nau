http://localhost:4000/graphql

```graphql
query AllFetchQuery {
  viewer {
    id
    name
    items {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}

query FetchUser {
  node(id: "VXNlcjox") {
    id
    ... on User {
      name
    }
  }
}


query FetchItem {
  node(id: "Um9ib3Q6NQ==") {
    id
    ... on Item {
      name
    }
  }
}

mutation AddItemMutation {
  addItem(input: {itemName: "new item", userId: "VXNlcjox"}) {
    item {
      id
      name
    }
  }
}

mutation UpdateItemMutation {
  updateItem(input: {newItemName: "updated item", itemId: "Um9ib3Q6NQ=="}) {
    item {
      id
      name
    }
  }
}

mutation RemoveItemMutation {
  removeItem(input: {itemId: "Um9ib3Q6NQ==", userId: "VXNlcjox"}) {
    item {
      id
      name
    }
  }
}
```
