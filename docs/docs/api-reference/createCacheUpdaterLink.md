# createCacheUpdaterLink

`createCacheUpdaterLink` creates an Apollo Link for Nau to manipulate the cache.

```tsx
const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });
// highlight-next-line
const cacheUpdaterLink = createCacheUpdaterLink();

const client = new ApolloClient({
  cache: new InMemoryCache({
    addTypename: true,
    possibleTypes: introspectionResult.possibleTypes,
    typePolicies: withCacheUpdater({}),
  }),
  // highlight-next-line
  link: from([cacheUpdaterLink, httpLink]),
});
```
