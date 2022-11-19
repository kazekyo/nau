
<h1 align="center">
Nau
</h1>

Nau is a tool that makes [Apollo Client](https://github.com/apollographql/apollo-client) more productive for users using [Relay GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification) compliant backends.

- Make cache operations very easy
- Provide custom directives to write declaratively and improve productivity
- Support co-location of components and fragments by allowing a query to split into the fragments
- Support subscriptions

The tool aims to help frontend developers build frontend applications more quickly, with fewer bugs, and more efficiently.

Nau is a perfect fit with React, Apollo Client, GraphQL Code Generator, and TypeScript.


## Installation
```
yarn add @kazekyo/nau
yarn add --dev @kazekyo/nau-graphql-codegen-preset
```

> ⚠️ The packages are currently under development. All version updates may have breaking changes.

## Documentation
https://www.naugraphql.com


## Example
![nau-demo](https://user-images.githubusercontent.com/456381/168417859-df6222b4-ae80-4dd1-a4ef-9117536bef14.gif)

See the [example code](https://github.com/kazekyo/nau/tree/main/examples/app).


You can write pagination and cache updates more easily using some GraphQL directives. :rocket:
```src/List.tsx
import { gql, useMutation, useSubscription } from '@apollo/client';
import { usePagination } from '@kazekyo/nau';
import * as React from 'react';
import {
  AddItemMutationDocument,
  ItemAddedSubscriptionDocument,
  ItemRemovedSubscriptionDocument,
  List_PaginationQueryDocument,
  List_UserFragment
} from './generated/graphql';
import ListItem from './ListItem';

gql`
  fragment List_user on User
  @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
  @refetchable(queryName: "List_PaginationQuery") {
    items(first: $count, after: $cursor) @pagination {
      edges {
        node {
          ...ListItem_item
        }
      }
    }
    ...ListItem_user
  }

  mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
    addItem(input: $input) {
      item @prependNode(connections: $connections) {
        ...ListItem_item
      }
    }
  }

  subscription ItemAddedSubscription($connections: [String!]!) {
    itemAdded {
      item @prependNode(connections: $connections) {
        ...ListItem_item
      }
    }
  }

  subscription ItemRemovedSubscription {
    itemRemoved {
      id @deleteRecord(typename: "Item")
    }
  }
`;

const List: React.FC<{ user: List_UserFragment }> = ({ user }) => {
  useSubscription(ItemAddedSubscriptionDocument, {
    variables: {
      connections: [user.items._connectionId],
    },
  });
  useSubscription(ItemRemovedSubscriptionDocument);
  const [addItem] = useMutation(AddItemMutationDocument);
  const { nodes, hasNext, loadNext, isLoading } = usePagination(List_PaginationQueryDocument, {
    id: user.id,
    connection: user.items,
  });

  return (
    <>
      <div>
        <button
          onClick={() =>
            void addItem({
              variables: {
                input: { itemName: 'new item', userId: user.id },
                connections: [user.items._connectionId],
              },
            })
          }
        >
          Add Item
        </button>
      </div>
      <div>
        {nodes.map((node) => {
          return (
            <div key={node.id}>
              <ListItem user={user} item={node} />
            </div>
          );
        })}
      </div>
      {hasNext && (
        <button onClick={() => loadNext(2)} disabled={!hasNext}>
          Load more
        </button>
      )}
    </>
  );
};

export default List;

```
