# @refetchable

Using the `@refetchable` directive, Nau can automatically create a query containing only a fragment. You need to set `queryName` to a name of the query to refetch.

For example, let's look at a following fragment:
```graphql
fragment List_user on User
@refetchable(queryName: "List_PaginationQuery") {
  id
  name
}
```

Nau will generate a query as follows:
```graphql
query List_PaginationQuery($id: ID!) {
  node(id: $id) {
    id
    __typename
    ...List_user
  }
}

fragment List_user on User
@refetchable(queryName: "List_PaginationQuery") {
  id
  name
}
```
