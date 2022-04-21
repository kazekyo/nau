import { ApolloClient, InMemoryCache, useMutation, useQuery, useSubscription } from '@apollo/client';
import { MockSubscriptionLink } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { clientMockedWrapperComponent, mockedWrapperComponent } from '../../../../utils/testing/mockedWrapperComponent';
import {
  DifferentArgsConnectionsQueryDataType,
  differentArgsConnectionsQueryDocument,
  differentArgsConnectionsQueryMockData,
  item11Id,
  item12Id,
  item1Id,
  item21Id,
  item2Id,
  QueryDataType,
  queryDocument,
  queryMockData,
  testTypePolicies,
} from './mock';
import {
  differentArgsMutationMockData1,
  differentArgsMutationMockData2,
  differentArgsMutationVariables1,
  differentArgsMutationVariables2,
  mutationDocument,
  mutationMockData,
  mutationVariables,
  prependItemToRootMutationVariables,
  subscriptionDocument,
  subscriptionMockData,
} from './prependNode.mock';

describe('@prependNode', () => {
  let cache: InMemoryCache;
  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: testTypePolicies,
    });
  });
  it('prepends the mutation result to the connection', async () => {
    const mocks = [
      { request: { query: queryDocument }, result: { data: queryMockData } },
      {
        request: { query: mutationDocument, variables: mutationVariables },
        result: { data: mutationMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

    const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
    act(() => {
      const [add] = useMutationHookResult.result.current;
      void add({ variables: mutationVariables });
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      viewer: {
        myItems: {
          edges: [
            { node: { id: item11Id, __typename: 'Item' }, cursor: '' },
            { node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' },
          ],
        },
      },
    });
  });

  it('prepends the mutation result to the connection of Root Query', async () => {
    const mocks = [
      { request: { query: queryDocument }, result: { data: queryMockData } },
      {
        request: { query: mutationDocument, variables: prependItemToRootMutationVariables },
        result: { data: mutationMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

    const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
    act(() => {
      const [add] = useMutationHookResult.result.current;
      void add({ variables: prependItemToRootMutationVariables });
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      items: {
        edges: [
          { node: { id: item11Id, __typename: 'Item' }, cursor: '' },
          { node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' },
        ],
      },
    });
  });

  it('prepends the mutation result to connections with different args', async () => {
    const mocks = [
      {
        request: { query: differentArgsConnectionsQueryDocument },
        result: { data: differentArgsConnectionsQueryMockData },
      },
      {
        request: { query: mutationDocument, variables: differentArgsMutationVariables1 },
        result: { data: differentArgsMutationMockData1 },
      },
      {
        request: { query: mutationDocument, variables: differentArgsMutationVariables2 },
        result: { data: differentArgsMutationMockData2 },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(
      () => useQuery<DifferentArgsConnectionsQueryDataType>(differentArgsConnectionsQueryDocument),
      {
        wrapper,
      },
    );
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(differentArgsConnectionsQueryMockData);

    const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
    act(() => {
      const [add] = useMutationHookResult.result.current;
      void add({ variables: differentArgsMutationVariables1 });
      void add({ variables: differentArgsMutationVariables2 });
    });

    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      viewer: {
        items1: {
          edges: [
            { node: { id: item11Id, __typename: 'Item' }, cursor: '' },
            { node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' },
          ],
        },
        items2: {
          edges: [
            { node: { id: item12Id, __typename: 'Item' }, cursor: '' },
            { node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' },
          ],
        },
      },
    });
  });

  it('prepends the subscription result to the connection', async () => {
    const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
    const wrapper = mockedWrapperComponent({ mocks, cache });
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

    const link = new MockSubscriptionLink();
    const client = new ApolloClient({ link, cache });
    const subscriptionWrapper = clientMockedWrapperComponent({ client });
    const useSubscriptionHookResult = renderHook(
      () =>
        useSubscription(subscriptionDocument, {
          variables: {
            connections: [useQueryHookResult.result.current.data?.viewer.myItems._connectionId],
          },
        }),
      { wrapper: subscriptionWrapper },
    );
    act(() => {
      link.simulateResult({ result: { data: subscriptionMockData } }, true);
    });
    await useSubscriptionHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);

    expect(useQueryHookResult.result.current.data).toMatchObject({
      viewer: {
        myItems: {
          edges: [
            { node: { id: item21Id, __typename: 'Item' }, cursor: '' },
            { node: { id: item1Id, __typename: 'Item' }, cursor: 'cursor-1' },
          ],
        },
      },
    });
  });
});
