
<h1 align="center">
Nau 🧶
</h1>

Nau is a library that makes it easy and convenient for [Apollo Client](https://github.com/apollographql/apollo-client) users to use a backend that follows [Relay GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification).

- It makes cache operations such as adding items and pagination very easy.
- You can use directives to write declaratively and reduce bugs.
- Support co-location of components and fragments by allowing a query splitting into the fragments.
- Support subscriptions.

This library aims to help the Relay GraphQL Server Specification users write frontend applications more quickly, with fewer bugs, and more efficiently.

## What's the Relay GraphQL Server Specification?
[Relay GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification) is a specification of GraphQL Server that makes GraphQL more effective.

Large parts of the specification are recognized as best practices in GraphQL.

- [Global Object Identification](https://graphql.org/learn/global-object-identification/)
- [Pagination](https://graphql.org/learn/pagination/)

Nau does not implement the specification on your server. Nau helps you develop frontend applications efficiently when you use a server that is compliant with the specification.

## Install
```
npm install @kazekyo/nau
```

## Guides
### Basic Setup
You need to import `nauLink` and pass the link to `ApolloClient`.

```tsx
import { ApolloClient, from, HttpLink } from '@apollo/client';
import { nauLink } from '@kazekyo/nau';

const myLink = from([nauLink, new HttpLink({ uri: 'http://localhost:3000/graphql' })])
const client = new ApolloClient({
  link: myLink,
});
```

### Updating the cache by mutation results
Nau can automatically add objects to a list (connection) on cache based on mutation results.

#### Setup
For example, a Type named `Foo` has a `barConnection` field, and you want to paginate this connection.
In this case, `InMemoryCache` setting should be as follows.

```ts
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client';
import { nauLink, relayPaginationFieldPolicy, withCacheUpdater } from '@kazekyo/nau';

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: withCacheUpdater({
      directiveAvailableTypes: ['Bar'],
      typePolicies: {
        Foo: { // Foo type
          fields: {
            barConnection: relayPaginationFieldPolicy(), // Foo.barConnection field
          },
        },
      },
    }),
  }),
  link: myLink,
});
```

You should use the `relayPaginationFieldPolicy` instead of Apollo Client's [`relayStylePagination`](https://www.apollographql.com/docs/react/pagination/cursor-based/#relay-style-cursor-pagination). Using the `relayPaginationFieldPolicy` allows you to paginate connections and use some directives to update the cache.

Another function is the `withCacheUpdater,` which is also needed to update the cache using directives.


#### Updating a connection in the cache
Using directives such as `@appendNode` will automatically add a item to a connection on the cache based on mutation results.

Let's look at an example.

```tsx
import { gql, useMutation } from '@apollo/client';
import { generateConnectionId } from '@kazekyo/nau';

const ADD_BAR = gql`
  mutation AddBar($input: AddBarInput!, $connections: [String!]!) {
    addBar(input: $input) {
      bar @appendNode(connections: $connections, edgeTypeName: "BarEdge") {
        id
      }
    }
  }
`;

const List: React.FC<{ foo: { id: string }}> = ({ foo }) => {
  const [add] = useMutation(ADD_BAR);
  const connectionId = generateConnectionId({ id: foo.id, field: 'barConnection' });

  // ...
  return (
    <>
      <button
        onClick={() =>
          void add({
            variables: {
              input: { text: 'hello', fooId: foo.id },
              connections: [connectionId],
            },
          })
        }
      >
        Add Bar
      </button>
      <div>
        {/* Display the list */}
      </div>
    </>
  );
}
```
Nau will automatically add a new `Bar` item to the `barConnection` in the cache.

`@appendNode` will add the item to the bottom of the list, and `@prependNode` will add to the top. Mutation results must contain an `id`.

You can also delete data with `@deleteRecord`.

See [Directives](https://github.com/kazekyo/nau#directives) for more information.

#### Requirements: id format
Global ids returned by your backend server must contain a type name. In general, backend servers that follow the Relay GraphQL Server Specification include the type name in the global id to make it unique. This is not a rule that is included in the Relay GraphQL Server Specification, but Nau requires this rule.

For example, some backend GraphQL frameworks encode a string like `${typename}:${localId}` to Base64 and use it as a global id.

Nau supports graphql-ruby format `${typename}|${localId}` and graphql-relay-js format `${typename}:${localId}`.

If you use other formats, set the `cacheIdGenerator`.

```tsx
import { decode } from 'js-base64';

// Example for the format `${typename}/${localId}`
const myCacheIdGenerator = (globalId: string): string => {
  const globalIdStr = decode(globalId);
  const [typename] = globalIdStr.split('/');
  // CacheIdGenerator must return values in the format `${typename}:${globalId}`.
  return `${typename}:${globalId}`;
};

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: withCacheUpdater({
      cacheIdGenerator: myCacheIdGenerator, // <-- Insert
      directiveAvailableTypes: ['Bar'],
      typePolicies: {
        Foo: {
          fields: {
            barConnection: relayPaginationFieldPolicy(),
          },
        },
      },
    }),
  }),
  link: myLink,
});
```

### Local variables in Fragment
We cannot define local variables in Fragment, so a variable name must be unique across all fragments used. And if we want to set a default value for a variable used in a fragment, we have to put it as a query variable.

You can use `@arguments` directive and `@argumentDefinitions` directive to solve this issue.

These can be used to create local variables for fragments. And the directives allow values to be passed from a parent query or fragment and allow default values to be set.

```graphql
query MyQuery($bazName: String!) {
  foo {
    ...bar @arguments(name: $bazName)
  }
}

fragment bar on Bar @argumentDefinitions(name: { type: "String!" }) {
    baz(name: $name) {
      id
    }
  }
`;
```

### Using pagination more efficiently and conveniently
When loading the next items in a connection, you will get all data that has nothing to do with the connection if you reuse a query used to display the current page.
But in most cases, it should be more efficient to request only the connection part.

By using some directives and hooks, we can paginate with less code while making efficient API requests.

The first step is to write a query in a component that displays a page.
The query does not contain a connection field directly but contains a fragment.

```tsx
const MY_PAGE_QUERY = gql`
  query MyPageQuery {
    foo {
      id
      ...ListComponent_foo
    }
  }
  ${MY_FRAGMENT}
`;

const PageComponent: React.FC = () =>  {
  const { loading, error, data } = useQuery(MY_PAGE_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      <div>
        Hello my page!
      </div>
      <div>
        {data.foo && <ListComponent foo={data.foo} />}
      </div>
    </>
  );
}
```

Define a component and the fragment that will display the items as follows.

```tsx
import { gql } from '@apollo/client';
import { getNodesFromConnection, usePaginationFragment } from '@kazekyo/nau';

export const MY_FRAGMENT = gql`
  fragment ListComponent_foo on Foo
  @argumentDefinitions(count: { type: "Int", defaultValue: 5 }, cursor: { type: "String" })
  @refetchable(queryName: "ListComponent_PaginationQuery") {
    id
    barConnection(first: $count, after: $cursor) @paginatable {
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

const ListComponent: React.FC<{ foo: { id: string } }> = ({ foo }) => {
  const { loadNext, hasNext, data } = usePaginationFragment({
    id: foo.id,
    fragment: MY_FRAGMENT,
    fragmentName: 'ListComponent_foo',
  });
  if (!data) return null;

  const nodes = getNodesFromConnection({ connection: data.barConnection });
  return (
    <>
      <div>
        {nodes.map((node) => (
          <div key={node.id}>{node.name}</div>
        ))}
      </div>
      <button onClick={() => loadNext(2)} disabled={!hasNext}>
        Load more
      </button>
    </>
  );
};
```

Now, the `ListComponent` can be paginated using the `ListComponent_foo` fragment only.

For more information about `@refetcable`, `@paginatable`, and `usePaginationFragment`, see the documentation of [Directives](https://github.com/kazekyo/nau#directives) and [Hooks](https://github.com/kazekyo/nau#hooks).


## Directives

### `@appendNode` / ` @prependNode`
`@appendNode` and `@prependNode` will automatically add an item from a mutation result to a connection on the cache.

The `@appendNode` will add the item to the bottom of the list, and the `@prependNode` will add to the top. The mutation result must contain an `id`.

`@appendNode`
```graphql
mutation AddBar($input: AddBarInput!, $connections: [String!]!) {
  addBar(input: $input) {
    bar @appendNode(connections: $connections, edgeTypeName: "BarEdge") {
      id # -> Bar.id
      __typename # -> 'Bar'
    }
  }
}
```

`@prependNode`
```graphql
mutation AddBar($input: AddBarInput!, $connections: [String!]!) {
  addBar(input: $input) {
    bar @appendNode(connections: $connections, edgeTypeName: "BarEdge") {
      id # -> Bar.id
      __typename # -> 'Bar'
    }
  }
}
```

### `@deleteRecord`
Use the `@deleteRecord` directive to delete a item in the cache based on a mutation result.

```graphql
mutation RemoveBar($input: RemoveRobotInput!) {
  removeBar(input: $input) {
    bar {
      id @deleteRecord
    }
  }
}
```

You can put this directive on only id fields.

Using this directive will remove the item from the cache. So if you have the item in connection A and B, `@deleteRecord` will remove the item from both connections.

### `@argumentDefinitions`
The `@argumentDefinitions` allows you to define fragment-specific variables. You can also set default values for the variables.

```graphql
fragment foo on Foo @argumentDefinitions(arg1: { type: "String!" }, arg2: { type: "Int!", defaultValue: 0 }) {
    foo(a: $arg1, b: $arg2) {
      id
      name
    }
  }
`;
```

### `@arguments`
Use the `@arguments` directive to pass variables to fragments.

```graphql
query MyQuery($barArg1: String!, $barArg2: Int!) {
  foo {
    ...bar @arguments(arg1: $barArg1, arg2: $barArg2)
  }
}
```

### `@refetchable`, `@paginatable`
Using the `@refetchable` directive, Nau can automatically create a query containing only a fragment and fetch items efficiently when paginating. You need to set `queryName` to some name of the query to refetch.
You need to set `@paginatable` for a connection that should be refetched.

`@refetchable` and `@paginatable` work together with `usePaginationFragment` hook.

```graphql
fragment ListComponent_foo on Foo
@argumentDefinitions(cursor: { type: "String" })
@refetchable(queryName: "ListComponent_PaginationQuery") {
  id
  barConnection(first: 5, after: $cursor) @paginatable {
    edges {
      node {
        id
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Hooks
### `usePaginationFragment`
You can use the `usePaginationFragment` hook to make pagination easier.

#### Params
| NAME | TYPE | DESCRIPTION |
|---|---|---|
| id | string |  A id of an object having Connection. |
| fragment | DocumentNode | A fragment. |
| fragmentName | string? | A name of a fragment. |


#### Result
| NAME | TYPE | DESCRIPTION |
|---|---|---|
| data | TFragmentData | An object containing the result of your GraphQL query. |
| loadNext | LoadPageFunction < TFragmentData > | A function used to fetch items on the next page in a connection. |
| loadPrevious | string | A function used to fetch items on the previous page in a connection. |
| hasNext | boolean | A value indicating whether item exists on the next page. |
| hasPrevious | boolean | A value indicating whether item exists on the previous page. |
| isLoadingNext | boolean | A value indicating whether the next page is currently loading. |
| isLoadingPrevious | boolean | A value indicating whether the previous page is currently loading. |

#### Examples
```tsx
const ListComponent: React.FC<{ foo: { id: string } }> = ({ foo }) => {
  const { loadNext, hasNext, data } = usePaginationFragment({
    id: foo.id,
    fragment: MY_FRAGMENT,
    fragmentName: 'ListComponent_foo',
  });
  if (!data) return null;

  const nodes = getNodesFromConnection({ connection: data.barConnection });
  return (
    <>
      <div>
        {nodes.map((node) => (
          <div key={node.id}>{node.name}</div>
        ))}
      </div>
      <button onClick={() => loadNext(2)} disabled={!hasNext}>
        Load more
      </button>
    </>
  );
};
```

## Functions / Utilities

### `withCacheUpdater`
The `withCacheUpdater` allows you to use some tools for updating the cache, such as `@appendNode`.


#### Params
| NAME | TYPE | DESCRIPTION |
|---|---|---|
| directiveAvailableTypes | string[] | A type that uses directives. |
| typePolicies | TypePolicies | A `TypePolicy` object. |
| cacheIdGenerator | CacheIdGenerator? | A function to generate the id of Apollo Client. |

The `directiveAvailableTypes` specify types for which directives are used. For example, if you want to use the `@prependNode` directive as follows, you need to specify `['Bar']` to `directiveAvailableTypes`.

```graphql
mutation Add {
  foo { # Foo Type
    bar @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) { # Bar Type
      id
    }
  }
}
```

#### Result
| TYPE | DESCRIPTION |
|---|---|
| TypePolicies | A new `TypePolicies` for updating the cache. |

### `relayPaginationFieldPolicy`
The `relayPaginationFieldPolicy` is an alternative function to `relayStylePagination` to use some cache updating directives such as `@appendNode`.

#### Params
| NAME | TYPE | DESCRIPTION |
|---|---|---|
| keyArgs | KeyArgs | A `keyArgs` to identify different lists. See the Apollo Client documentation for details. |

### `generateConnectionId`
The `generateConnectionId` generates an id to be used for `@appendNode`, etc.

#### Params
| NAME | TYPE | DESCRIPTION |
|---|---|---|
| id | string? | An id of an object having Connection. The default value is `ROOT_QUERY`. |
| field | string | A field name of a connection. |
| args | Record<string, unknown>? | A connection having edges. |

#### Result
| TYPE | DESCRIPTION |
|---|---|
| string | The connectionId. |

#### Examples
```tsx
const mutationDocument = gql`
  mutation AddBarMutation($connections: [String!]!, $edgeTypeName: String!, $input: AddBarInput!) {
    addBar(input: $input) {
      bar @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
        id
      }
    }
  }
`;

const Component: React.FC<{ foo: { id: string } }> = ({ foo }) => {
  // ...
  const [addBar] = useMutation(mutationDocument);
  const connectionId = generateConnectionId({ id: foo.id, field: 'bars', args: { search: 'a' } });

  return (
    <button
      onClick={() =>
        addBar({ variables: { connections: [connectionId], edgeTypeName: 'BarEdge', input: { text: 'a' } } })
      }
    >
      Add bar
    </button>
  );
};
```

### `getNodesFromConnection`
The `getNodesFromConnection` gets nodes from a connection, filtering null and undefined.

#### Params
| NAME | TYPE | DESCRIPTION |
|---|---|---|
| connection | TConnection | A connection having edges. |

#### Result
| TYPE | DESCRIPTION |
|---|---|
| TNode[] | The array of nodes. |

## An example
You can find an example of a complete application using Nau [here](https://github.com/kazekyo/nau/tree/main/example/frontend-apollo).


## Goal
This library is inspired by Relay and we have reproduced some features of Relay.
However, the goal is not to create a full copy of Relay on Apollo Client.

Our goal is to make Apollo Client more powerful by integrating Relay GraphQL Server Specification.

## TODO
- Support graphql-code-generator
