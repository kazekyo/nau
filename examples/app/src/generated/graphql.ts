import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AddItemInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  itemName: Scalars['String'];
  userId: Scalars['ID'];
};

export type AddItemPayload = {
  __typename?: 'AddItemPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  item: Item;
};

export type Item = Node & {
  __typename?: 'Item';
  /** The ID of an object */
  id: Scalars['ID'];
  /** The name of the item. */
  name: Scalars['String'];
};

export type ItemAddedPayload = {
  __typename?: 'ItemAddedPayload';
  item: Item;
};

/** A connection to a list of items. */
export type ItemConnection = {
  __typename?: 'ItemConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ItemEdge>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ItemEdge = {
  __typename?: 'ItemEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<Item>;
};

export type ItemRemovedPayload = {
  __typename?: 'ItemRemovedPayload';
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addItem?: Maybe<AddItemPayload>;
  removeItem?: Maybe<RemoveItemPayload>;
  updateItem?: Maybe<UpdateItemPayload>;
};


export type MutationAddItemArgs = {
  input: AddItemInput;
};


export type MutationRemoveItemArgs = {
  input: RemoveItemInput;
};


export type MutationUpdateItemArgs = {
  input: UpdateItemInput;
};

/** An object with an ID */
export type Node = {
  /** The id of the object. */
  id: Scalars['ID'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Fetches an object given its ID */
  node?: Maybe<Node>;
  viewer?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};

export type RemoveItemInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  itemId: Scalars['String'];
  userId: Scalars['ID'];
};

export type RemoveItemPayload = {
  __typename?: 'RemoveItemPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  item: Item;
};

export type Subscription = {
  __typename?: 'Subscription';
  itemAdded: ItemAddedPayload;
  itemRemoved: ItemRemovedPayload;
};

export type UpdateItemInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  itemId: Scalars['ID'];
  newItemName: Scalars['String'];
};

export type UpdateItemPayload = {
  __typename?: 'UpdateItemPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  item: Item;
};

export type User = Node & {
  __typename?: 'User';
  /** The ID of an object */
  id: Scalars['ID'];
  items?: Maybe<ItemConnection>;
  /** The name of the user. */
  name?: Maybe<Scalars['String']>;
};


export type UserItemsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  keyword?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
};

export type MyFragment1_UserFragment = { __typename?: 'User', name?: string | null | undefined, items5?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', node?: { __typename?: 'Item', id: string } | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type MyAppQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAppQueryQuery = { __typename?: 'Query', viewer?: { __typename?: 'User', id: string, name?: string | null | undefined, items5?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', node?: { __typename?: 'Item', id: string } | null | undefined } | null | undefined> | null | undefined } | null | undefined, items3?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', node?: { __typename?: 'Item', id: string } | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined };

export type MyFragment2_UserFragment = { __typename?: 'User', name?: string | null | undefined, items3?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', node?: { __typename?: 'Item', id: string } | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type App_PaginationQueryQueryVariables = Exact<{
  count?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
}>;


export type App_PaginationQueryQuery = { __typename?: 'Query', node?: { __typename: 'Item', id: string } | { __typename: 'User', id: string, name?: string | null | undefined, items5?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', node?: { __typename?: 'Item', id: string } | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined };

export const MyFragment1_UserFragmentDoc = gql`
    fragment MyFragment1_user on User {
  name
  items5: items(first: 5) {
    edges {
      node {
        id
      }
    }
  }
}
    `;
export const MyFragment2_UserFragmentDoc = gql`
    fragment MyFragment2_user on User {
  name
  items3: items(first: 3) {
    edges {
      node {
        id
      }
    }
  }
}
    `;
export const MyAppQueryDocument = gql`
    query MyAppQuery {
  viewer {
    id
    ...MyFragment1_user
    ...MyFragment2_user
  }
}
    ${MyFragment1_UserFragmentDoc}
${MyFragment2_UserFragmentDoc}`;

/**
 * __useMyAppQueryQuery__
 *
 * To run a query within a React component, call `useMyAppQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyAppQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyAppQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyAppQueryQuery(baseOptions?: Apollo.QueryHookOptions<MyAppQueryQuery, MyAppQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyAppQueryQuery, MyAppQueryQueryVariables>(MyAppQueryDocument, options);
      }
export function useMyAppQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyAppQueryQuery, MyAppQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyAppQueryQuery, MyAppQueryQueryVariables>(MyAppQueryDocument, options);
        }
export type MyAppQueryQueryHookResult = ReturnType<typeof useMyAppQueryQuery>;
export type MyAppQueryLazyQueryHookResult = ReturnType<typeof useMyAppQueryLazyQuery>;
export type MyAppQueryQueryResult = Apollo.QueryResult<MyAppQueryQuery, MyAppQueryQueryVariables>;
export const App_PaginationQueryDocument = gql`
    query App_PaginationQuery($count: Int = 1, $id: ID!) {
  node(id: $id) {
    id
    __typename
    ...MyFragment1_user
  }
}
    ${MyFragment1_UserFragmentDoc}`;

/**
 * __useApp_PaginationQueryQuery__
 *
 * To run a query within a React component, call `useApp_PaginationQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useApp_PaginationQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApp_PaginationQueryQuery({
 *   variables: {
 *      count: // value for 'count'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useApp_PaginationQueryQuery(baseOptions: Apollo.QueryHookOptions<App_PaginationQueryQuery, App_PaginationQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<App_PaginationQueryQuery, App_PaginationQueryQueryVariables>(App_PaginationQueryDocument, options);
      }
export function useApp_PaginationQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<App_PaginationQueryQuery, App_PaginationQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<App_PaginationQueryQuery, App_PaginationQueryQueryVariables>(App_PaginationQueryDocument, options);
        }
export type App_PaginationQueryQueryHookResult = ReturnType<typeof useApp_PaginationQueryQuery>;
export type App_PaginationQueryLazyQueryHookResult = ReturnType<typeof useApp_PaginationQueryLazyQuery>;
export type App_PaginationQueryQueryResult = Apollo.QueryResult<App_PaginationQueryQuery, App_PaginationQueryQueryVariables>;