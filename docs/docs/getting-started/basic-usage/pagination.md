---
sidebar_position: 1
---

#  Pagination

By using some directives and hooks, you can paginate with less code while making efficient API requests.

Here is an example component. Let's implement it using this component.

```tsx title="src/List.tsx"
import { List_PaginationQueryDocument, List_UserFragment } from './generated/graphql';

gql` /* GraphQL */
  fragment List_user on User {
    id
    items(first: $count, after: $cursor) {
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const List: React.FC<{ user: List_UserFragment; }> = ({ user }) => {
  // Retrieve nodes from user
  // ...
  return (
    <>
      <div>
        {nodes.map((node, i) => {
          return (
            <div>{node.name}</div>
          );
        })}
      </div>
      {/* ... */}
    </>
  );
};
```

First, add the following directives: `@argumentDefinitions`, `@refetchable`, and `@pagination`. You may also remove some fields only for pagination, such as `pageInfo`, from the fragment, as Nau will automatically complete them for you.

```graphql
fragment List_user on User
// highlight-start
@argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
@refetchable(queryName: "List_PaginationQuery") {
// highlight-end
  id
  // highlight-next-line
  items(first: $count, after: $cursor) @pagination {
    edges {
      node {
        name
      }
    }
  }
}
```

Run `graphql-codegen`.
```bash
yarn graphql-codegen
```

You can easily implement pagination using the generated `List_PaginationQueryDocument` with `usePagination`.

```tsx title="src/List.tsx"
// highlight-start
import { usePagination } from '@kazekyo/nau';
import { List_PaginationQueryDocument, List_UserFragment } from './generated/graphql';
// highlight-end

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
`;

const List: React.FC<{ user: List_UserFragment; }> = ({ user }) => {
  // highlight-start
  const { nodes, hasNext, loadNext, isLoading } = usePagination(List_PaginationQueryDocument, {
    id: user.id,
    connection: user.items,
  });
  // highlight-end

  return (
    <>
      <div>
        {nodes.map((node, i) => {
          return (
            <div>{node.name}</div>
          );
        })}
      </div>
      // highlight-start
      {hasNext && (
        <Button
          onClick={() => loadNext(2)}
          disabled={!hasNext}
          isLoading={isLoading}
        >
          Load more
        </Button>
      )}
      // highlight-end
    </>
  );
};
```

Note that whether you are using Nau or not, remember that you must have pagination configured in your cache.

```tsx title="src/index.tsx"
// highlight-next-line
import { relayStylePagination } from '@apollo/client/utilities';

const client = new ApolloClient({
  cache: new InMemoryCache({
    addTypename: true,
    possibleTypes: introspectionResult.possibleTypes,
    typePolicies: withCacheUpdater({
      // highlight-start
      User: {
        fields: {
          items: relayStylePagination(),
        },
      },
      // highlight-end
    }),
  }),
  link: splitLink,
});
```
