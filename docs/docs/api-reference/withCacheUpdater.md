# withCacheUpdater

The `withCacheUpdater` allows you to use some tools for updating the cache, such as `@appendNode`.

```tsx
new InMemoryCache({
  addTypename: true,
  possibleTypes: introspectionResult.possibleTypes,
  // highlight-start
  typePolicies: withCacheUpdater({
    User: {
      fields: {
        items: relayStylePagination(),
      },
    },
  }),
  // highlight-end
}),
```


## Arguments
- `typePolicies`: A `TypePolicy` object. Set `relayStylePagination()` for fields to which `@pagination` is attached.
