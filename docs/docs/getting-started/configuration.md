---
sidebar_position: 2
---

# Configuration

You should be familiar with [React](https://reactjs.org/), [Apollo Client](https://www.apollographql.com/docs/react/), and [GraphQL Code Generator](https://www.graphql-code-generator.com/) as a prerequisite. If you have never used them, you will need to read their documentation first.

# Configration for Nau
First, add `@kazekyo/nau-graphql-codegen-preset` to your `codegen.yml`. You should add this preset to the generation process of all files under `generators`.


```yaml title="./codegen.yml"
schema: http://localhost:4000/graphql
documents:
  - src/**/*.tsx
generates:
  src/generated/graphql.ts:
    // highlight-start
    preset: '@kazekyo/nau-graphql-codegen-preset'
    presetConfig:
      generateTypeScriptCode: true
    // highlight-end
    plugins:
      - typescript
      - typescript-operations
      - typed-document-node
  src/generated/introspection-result.json:
    // highlight-next-line
    preset: '@kazekyo/nau-graphql-codegen-preset'
    plugins:
      - fragment-matcher
  ./schema.graphql:
    // highlight-next-line
    preset: '@kazekyo/nau-graphql-codegen-preset'
    plugins:
      - schema-ast
```

Run GraphQL Code Generator.
```bash
yarn graphql-codegen
```

And Configure your cache settings for Apollo Client. Import and use `withCacheUpdater` from the generated file, and also use some functions of `@kazekyo/nau`.
```tsx title="src/index.tsx"
import { ApolloClient, ApolloProvider, from, HttpLink, InMemoryCache, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
// highlight-next-line
import { createCacheUpdaterLink, isSubscriptionOperation } from '@kazekyo/nau';
// highlight-next-line
import { withCacheUpdater } from './generated/graphql';
// highlight-next-line
import introspectionResult from './generated/introspection-result.json';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/subscriptions',
  options: {
    reconnect: true,
  },
});
const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });
// highlight-next-line
const cacheUpdaterLink = createCacheUpdaterLink();

const splitLink = split(
  ({ query }) => isSubscriptionOperation(query),
  // highlight-start
  from([cacheUpdaterLink, wsLink]),
  from([cacheUpdaterLink, httpLink]),
  // highlight-end
);

const client = new ApolloClient({
  cache: new InMemoryCache({
    // highlight-start
    addTypename: true, // Do not set false
    possibleTypes: introspectionResult.possibleTypes,
    typePolicies: withCacheUpdater({}),
    // highlight-end
  }),
  link: splitLink,
});
```

That's it for the configuration!
