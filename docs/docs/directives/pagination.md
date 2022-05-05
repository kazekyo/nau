# @pagination

By attaching the `pagination` directive, you indicate to Nau that this is a connection for pagination.

Nau will determine fields you have not written in your query (e.g. the `pageInfo` field) and add them if necessary. It also generates some TypeScript code for caching.

For example, let's look at a following query:
```graphql
query TestQuery($cursor: String) {
  viewer {
    // highlight-next-line
    items(first: 1, after: $cursor) @pagination {
      edges {
        node {
          name
        }
      }
    }
  }
}
```
Nau will rewrite the query as follows:
```graphql
query TestQuery($cursor: String) {
  viewer {
    items(first: 1, after: $cursor) @pagination {
      edges {
        node {
          name
          // highlight-start
          id
          __typename
          // highlight-end
        }
        // highlight-next-line
        cursor
      }
      // highlight-start
      pageInfo {
        hasNextPage
        endCursor
        hasPreviousPage
        startCursor
      }
      _connectionId @client
      // highlight-end
    }
    // highlight-start
    id
    __typename
    // highlight-end
  }
}
```
