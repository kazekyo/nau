import { TypePolicy } from '@apollo/client';
import { withCacheUpdaterInternal } from '@nau/core';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

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
  /** Information of the connection for a client */
  _connectionId: Scalars['String'];
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
  items: ItemConnection;
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
  items: ItemConnection;
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


export type AppQuery = { __typename?: 'Query', viewer?: { __typename?: 'User', id: string, name?: string | null | undefined, items: { __typename?: 'ItemConnection', _connectionId: string, edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } } | null | undefined };

export type ListItem_ItemFragment = { __typename?: 'Item', id: string, name: string };

export type ListItem_UserFragment = { __typename?: 'User', id: string };

export type List_UserFragment = { __typename?: 'User', id: string, items: { __typename?: 'ItemConnection', _connectionId: string, edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } };

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


export type List_PaginationQuery = { __typename?: 'Query', node?: { __typename: 'Item', id: string } | { __typename: 'User', id: string, items: { __typename?: 'ItemConnection', _connectionId: string, edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } } | null | undefined };

export type List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragment = { __typename?: 'User', id: string, items: { __typename?: 'ItemConnection', _connectionId: string, edges?: Array<{ __typename?: 'ItemEdge', cursor: string, node?: { __typename: 'Item', id: string, name: string } | null | undefined } | null | undefined> | null | undefined, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null | undefined, hasPreviousPage: boolean, startCursor?: string | null | undefined } } };

export const ListItem_ItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ListItem_item"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<ListItem_ItemFragment, unknown>;
export const ListItem_UserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ListItem_user"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]} as unknown as DocumentNode<ListItem_UserFragment, unknown>;
export const List_UserFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"List_user"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"2"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"NullValue"}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"NullValue"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListItem_item"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"_connectionId"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}]}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListItem_user"}}]}},...ListItem_ItemFragmentDoc.definitions,...ListItem_UserFragmentDoc.definitions]} as unknown as DocumentNode<List_UserFragment, unknown>;
export const List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"List_user_bi8zLGNvdW50LGN1cnNvcixrZXl3b3Jk"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}},{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListItem_item"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"_connectionId"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"client"}}]}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListItem_user"}}]}},...ListItem_ItemFragmentDoc.definitions,...ListItem_UserFragmentDoc.definitions]} as unknown as DocumentNode<List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragment, unknown>;
export const AppQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AppQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"List_user"}}]}}]}},...List_UserFragmentDoc.definitions]} as unknown as DocumentNode<AppQuery, AppQueryVariables>;
export const AddItemMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddItemMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddItemInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"connections"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"prependNode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"connections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"connections"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListItem_item"}}]}}]}}]}},...ListItem_ItemFragmentDoc.definitions]} as unknown as DocumentNode<AddItemMutation, AddItemMutationVariables>;
export const ItemAddedSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ItemAddedSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"connections"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemAdded"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"prependNode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"connections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"connections"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ItemAddedSubscription, ItemAddedSubscriptionVariables>;
export const ItemRemovedSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ItemRemovedSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemRemoved"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"deleteRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"typename"},"value":{"kind":"StringValue","value":"Item","block":false}}]}]}]}}]}}]} as unknown as DocumentNode<ItemRemovedSubscription, ItemRemovedSubscriptionVariables>;
export const RemoveItemMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveItemMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removedItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"deleteRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"typename"},"value":{"kind":"StringValue","value":"Item","block":false}}]}]}]}}]}}]}}]} as unknown as DocumentNode<RemoveItemMutation, RemoveItemMutationVariables>;
export const List_PaginationQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"List_PaginationQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"2"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"List_user_bi8zLGNvdW50LGN1cnNvcixrZXl3b3Jk"}}]}}]}},...List_User_Bi8zLgNvdW50Lgn1cnNvcixrZXl3b3JkFragmentDoc.definitions]} as unknown as DocumentNode<List_PaginationQuery, List_PaginationQueryVariables>;