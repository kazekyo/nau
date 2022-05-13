---
sidebar_position: 1
---

# Pagination
When loading the next edges in a connection, you will get all data that has nothing to do with the connection if you reuse a query used to display the current page. But in most cases, it should be more efficient to request only the connection part.

By using some directives and hooks, you can paginate with less code while making efficient API requests.

First, create a fragment in the list component. Then, add some directives to that fragment.
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
Attaching `@refetchable` to a fragment generates a query for refetching data using `node(id:)` in your backend API. The `@argumentDefinitions` are needed to define necessary variables when generating the refetch query. Attach `@pagination` to the connection field to indicate to Nau which part of the query is the connection to be paginated.

Let's use the generated refetch query.

```tsx
const { nodes, hasNext, loadNext, isLoading } = usePagination(List_PaginationQueryDocument, {
  id: user.id,
  connection: user.items,
});
```
Nau generates the refetch query with the name specified in the `queryName` argument of `@refetchable`. You can use it with `usePagination`.

The `id` argument of `usePagination` will be the `id` specified in `node(id:)`. The `connection` argument is the field to which `@pagination` is attached.


You can use return values of `usePagination` to display data and place a "read more" button.

```tsx title="src/List.tsx"
import { usePagination } from '@kazekyo/nau';
import { List_PaginationQueryDocument, List_UserFragment } from './generated/graphql';

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
  const { nodes, hasNext, loadNext, isLoading } = usePagination(List_PaginationQueryDocument, {
    id: user.id,
    connection: user.items,
  });

  return (
    <>
      <div>
        {nodes.map((node, i) => {
          return (
            <div>{node.name}</div>
          );
        })}
      </div>
      {hasNext && (
        <Button
          onClick={() => loadNext(2)}
          disabled={!hasNext}
          isLoading={isLoading}
        >
          Load more
        </Button>
      )}
    </>
  );
};
```
