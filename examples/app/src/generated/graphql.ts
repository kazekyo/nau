import { TypePolicy } from '@apollo/client';
import { withCacheUpdaterInternal } from '@nau/cache-updater';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}

export const paginationMetaList = [{ node: { typename: 'Item' }, parents: [{ typename: 'User', connection: { fieldName: 'items' }, edge: { typename: 'ItemEdge' } }] }];

export const deleteRecordMetaList = [{ parent: { typename: 'ItemRemovedPayload' }, fields: [{ fieldName: 'id', typename: 'Item' }] }, { parent: { typename: 'RemovedItem' }, fields: [{ fieldName: 'id', typename: 'Item' }] }];

export type CacheUpdaterTypePolicies = {
  User: TypePolicy;
  [__typename: string]: TypePolicy;
};

export const withCacheUpdater = (typePolicies: CacheUpdaterTypePolicies) =>
  withCacheUpdaterInternal({
    paginationMetaList,
    deleteRecordMetaList,
    typePolicies,
  });
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
  /** The ID of an object */
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
  items?: Maybe<ItemConnection>;
  /** Fetches an object given its ID */
  node?: Maybe<Node>;
  viewer?: Maybe<User>;
};


export type QueryItemsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  keyword?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
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
  removedItem: RemovedItem;
};

export type RemovedItem = {
  __typename?: 'RemovedItem';
  /** The ID of an object */
  id: Scalars['ID'];
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

export type AppQueryVariables = Exact<{ [key: string]: never; }>;


export type AppQuery = { __typename?: 'Query', viewer?: { __typename?: 'User', id: string, name?: string | null | undefined, items?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } | null | undefined } | null | undefined };

export type ListItem_ItemFragment = { __typename?: 'Item', id: string, name: string };

export type ListItem_UserFragment = { __typename?: 'User', id: string };

export type List_UserFragment = { __typename?: 'User', id: string, items?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } | null | undefined };

export type AddItemMutationVariables = Exact<{
  input: AddItemInput;
  connections: Array<Scalars['String']> | Scalars['String'];
}>;


export type AddItemMutation = { __typename?: 'Mutation', addItem?: { __typename?: 'AddItemPayload', item: { __typename?: 'Item', id: string, name: string } } | null | undefined };

export type ItemAddedSubscriptionVariables = Exact<{
  connections: Array<Scalars['String']> | Scalars['String'];
}>;


export type ItemAddedSubscription = { __typename?: 'Subscription', itemAdded: { __typename?: 'ItemAddedPayload', item: { __typename?: 'Item', id: string, name: string } } };

export type ItemRemovedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ItemRemovedSubscription = { __typename?: 'Subscription', itemRemoved: { __typename?: 'ItemRemovedPayload', id: string } };

export type RemoveItemMutationVariables = Exact<{
  input: RemoveItemInput;
}>;


export type RemoveItemMutation = { __typename?: 'Mutation', removeItem?: { __typename?: 'RemoveItemPayload', removedItem: { __typename?: 'RemovedItem', id: string } } | null | undefined };

export type List_PaginationQueryVariables = Exact<{
  count?: Maybe<Scalars['Int']>;
  cursor?: Maybe<Scalars['String']>;
  keyword?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
}>;


export type List_PaginationQuery = { __typename?: 'Query', node?: { __typename: 'Item', id: string } | { __typename: 'User', id: string, items?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } | null | undefined } | null | undefined };

export type List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragment = { __typename?: 'User', id: string, items?: { __typename?: 'ItemConnection', edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } | null | undefined };

export const ListItem_ItemFragmentDoc = gql`
    fragment ListItem_item on Item {
  id
  name
}
    `;
export const ListItem_UserFragmentDoc = gql`
    fragment ListItem_user on User {
  id
}
    `;
export const List_UserFragmentDoc = gql`
    fragment List_user on User {
  id
  items(first: 2, after: null, keyword: null) {
    edges {
      node {
        id
        ...ListItem_item
        __typename
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
      hasPreviousPage
      startCursor
    }
  }
  ...ListItem_user
}
    ${ListItem_ItemFragmentDoc}
${ListItem_UserFragmentDoc}`;
export const List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragmentDoc = gql`
    fragment List_user_bi8zLGNvdW50LGN1cnNvcixrZXl3b3Jk on User {
  id
  items(first: $count, after: $cursor, keyword: $keyword) {
    edges {
      node {
        id
        ...ListItem_item
        __typename
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
      hasPreviousPage
      startCursor
    }
  }
  ...ListItem_user
}
    ${ListItem_ItemFragmentDoc}
${ListItem_UserFragmentDoc}`;
export const AppQueryDocument = gql`
    query AppQuery {
  viewer {
    id
    name
    ...List_user
  }
}
    ${List_UserFragmentDoc}`;

/**
 * __useAppQuery__
 *
 * To run a query within a React component, call `useAppQuery` and pass it any options that fit your needs.
 * When your component renders, `useAppQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAppQuery({
 *   variables: {
 *   },
 * });
 */
export function useAppQuery(baseOptions?: Apollo.QueryHookOptions<AppQuery, AppQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AppQuery, AppQueryVariables>(AppQueryDocument, options);
      }
export function useAppQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AppQuery, AppQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AppQuery, AppQueryVariables>(AppQueryDocument, options);
        }
export type AppQueryHookResult = ReturnType<typeof useAppQuery>;
export type AppQueryLazyQueryHookResult = ReturnType<typeof useAppQueryLazyQuery>;
export type AppQueryQueryResult = Apollo.QueryResult<AppQuery, AppQueryVariables>;
export const AddItemMutationDocument = gql`
    mutation AddItemMutation($input: AddItemInput!, $connections: [String!]!) {
  addItem(input: $input) {
    item @prependNode(connections: $connections) {
      id
      ...ListItem_item
    }
  }
}
    ${ListItem_ItemFragmentDoc}`;
export type AddItemMutationMutationFn = Apollo.MutationFunction<AddItemMutation, AddItemMutationVariables>;

/**
 * __useAddItemMutation__
 *
 * To run a mutation, you first call `useAddItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addItemMutation, { data, loading, error }] = useAddItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *      connections: // value for 'connections'
 *   },
 * });
 */
export function useAddItemMutation(baseOptions?: Apollo.MutationHookOptions<AddItemMutation, AddItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddItemMutation, AddItemMutationVariables>(AddItemMutationDocument, options);
      }
export type AddItemMutationHookResult = ReturnType<typeof useAddItemMutation>;
export type AddItemMutationMutationResult = Apollo.MutationResult<AddItemMutation>;
export type AddItemMutationMutationOptions = Apollo.BaseMutationOptions<AddItemMutation, AddItemMutationVariables>;
export const ItemAddedSubscriptionDocument = gql`
    subscription ItemAddedSubscription($connections: [String!]!) {
  itemAdded {
    item @prependNode(connections: $connections) {
      id
      name
    }
  }
}
    `;

/**
 * __useItemAddedSubscription__
 *
 * To run a query within a React component, call `useItemAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useItemAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemAddedSubscription({
 *   variables: {
 *      connections: // value for 'connections'
 *   },
 * });
 */
export function useItemAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ItemAddedSubscription, ItemAddedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ItemAddedSubscription, ItemAddedSubscriptionVariables>(ItemAddedSubscriptionDocument, options);
      }
export type ItemAddedSubscriptionHookResult = ReturnType<typeof useItemAddedSubscription>;
export type ItemAddedSubscriptionSubscriptionResult = Apollo.SubscriptionResult<ItemAddedSubscription>;
export const ItemRemovedSubscriptionDocument = gql`
    subscription ItemRemovedSubscription {
  itemRemoved {
    id @deleteRecord(typename: "Item")
  }
}
    `;

/**
 * __useItemRemovedSubscription__
 *
 * To run a query within a React component, call `useItemRemovedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useItemRemovedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useItemRemovedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useItemRemovedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ItemRemovedSubscription, ItemRemovedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ItemRemovedSubscription, ItemRemovedSubscriptionVariables>(ItemRemovedSubscriptionDocument, options);
      }
export type ItemRemovedSubscriptionHookResult = ReturnType<typeof useItemRemovedSubscription>;
export type ItemRemovedSubscriptionSubscriptionResult = Apollo.SubscriptionResult<ItemRemovedSubscription>;
export const RemoveItemMutationDocument = gql`
    mutation RemoveItemMutation($input: RemoveItemInput!) {
  removeItem(input: $input) {
    removedItem {
      id @deleteRecord(typename: "Item")
    }
  }
}
    `;
export type RemoveItemMutationMutationFn = Apollo.MutationFunction<RemoveItemMutation, RemoveItemMutationVariables>;

/**
 * __useRemoveItemMutation__
 *
 * To run a mutation, you first call `useRemoveItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeItemMutation, { data, loading, error }] = useRemoveItemMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveItemMutation(baseOptions?: Apollo.MutationHookOptions<RemoveItemMutation, RemoveItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveItemMutation, RemoveItemMutationVariables>(RemoveItemMutationDocument, options);
      }
export type RemoveItemMutationHookResult = ReturnType<typeof useRemoveItemMutation>;
export type RemoveItemMutationMutationResult = Apollo.MutationResult<RemoveItemMutation>;
export type RemoveItemMutationMutationOptions = Apollo.BaseMutationOptions<RemoveItemMutation, RemoveItemMutationVariables>;
export const List_PaginationQueryDocument = gql`
    query List_PaginationQuery($count: Int = 2, $cursor: String, $keyword: String, $id: ID!) {
  node(id: $id) {
    id
    __typename
    ...List_user_bi8zLGNvdW50LGN1cnNvcixrZXl3b3Jk
  }
}
    ${List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragmentDoc}`;

/**
 * __useList_PaginationQuery__
 *
 * To run a query within a React component, call `useList_PaginationQuery` and pass it any options that fit your needs.
 * When your component renders, `useList_PaginationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useList_PaginationQuery({
 *   variables: {
 *      count: // value for 'count'
 *      cursor: // value for 'cursor'
 *      keyword: // value for 'keyword'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useList_PaginationQuery(baseOptions: Apollo.QueryHookOptions<List_PaginationQuery, List_PaginationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<List_PaginationQuery, List_PaginationQueryVariables>(List_PaginationQueryDocument, options);
      }
export function useList_PaginationQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<List_PaginationQuery, List_PaginationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<List_PaginationQuery, List_PaginationQueryVariables>(List_PaginationQueryDocument, options);
        }
export type List_PaginationQueryHookResult = ReturnType<typeof useList_PaginationQuery>;
export type List_PaginationQueryLazyQueryHookResult = ReturnType<typeof useList_PaginationQueryLazyQuery>;
export type List_PaginationQueryQueryResult = Apollo.QueryResult<List_PaginationQuery, List_PaginationQueryVariables>;