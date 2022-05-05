# @appendNode / @prependNode

`@appendNode` and `@prependNode` will automatically add data from a mutation result to a connection on the cache.

The `@appendNode` will add an element to the bottom of a list, and the `@prependNode` will add it to the top.
### `@appendNode`
```graphql
mutation AddBar($input: AddBarInput!, $connections: [String!]!) {
  addBar(input: $input) {
    bar @appendNode(connections: $connections) {
      name
    }
  }
}
```

### `@prependNode`
```graphql
mutation AddBar($input: AddBarInput!, $connections: [String!]!) {
  addBar(input: $input) {
    bar @appendNode(connections: $connections) {
      name
    }
  }
}
```
