# usePagination

The `usePagination` is Hook for easy handling of pagination.

```tsx
const { nodes, hasNext, loadNext, isLoading } = usePagination(List_PaginationQueryDocument, {
  id: user.id,
  connection: user.items,
});
```

## Arguments
- `document`: A GraphQL query document.
- `options`:
  - `id`: A id of an object having Connection.
  - `connection`: A connection field.
  - `variables`: Variables required for query.


## Result
- `nodes`: Array of nodes retrieved from a connection.
- `loadNext`: A function used to fetch items on the next page in a connection.
- `loadPrevious`: A function used to fetch items on the previous page in a connection.
- `hasNext`: A value indicating whether item exists on the next page.
- `hasPrevious`: A value indicating whether item exists on the previous page.
- `isLoading`:   value indicating whether the next/previous page is currently loading.
