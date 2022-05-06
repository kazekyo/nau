import { ApolloClient, InMemoryCache, useMutation, useQuery, useSubscription } from '@apollo/client';
import { MockSubscriptionLink } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { clientMockedWrapperComponent, mockedWrapperComponent } from '../../../utils/testing/mockedWrapperComponent';
import {
  item2Id,
  mutationDocument,
  mutationMockData,
  mutationVariables,
  QueryDataType,
  queryDocument,
  queryMockData,
  subscriptionDocument,
  subscriptionMockData,
  testTypePolicies,
} from './deleteRecord.mock';

describe('@deleteRecord', () => {
  let cache: InMemoryCache;
  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: testTypePolicies,
    });
  });

  it('deletes the mutation result from the cache', async () => {
    const mocks = [
      { request: { query: queryDocument }, result: { data: queryMockData } },
      { request: { query: mutationDocument, variables: mutationVariables }, result: { data: mutationMockData } },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.items1.edges.length).toBe(1);
    });
    expect(useQueryHookResult.result.current.data?.viewer.items2.edges.length).toBe(2);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

    const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
    act(() => {
      const [deleteFunc] = useMutationHookResult.result.current;
      void deleteFunc({ variables: mutationVariables });
    });

    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.items1.edges.length).toBe(0);
    });
    expect(useQueryHookResult.result.current.data?.items1.edges.length).toBe(0);
    expect(useQueryHookResult.result.current.data?.viewer.items2.edges.length).toBe(1);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      items1: {
        edges: [],
      },
      viewer: {
        items2: {
          edges: [{ node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' }],
        },
      },
    });
  });

  it('deletes the subscription result from the cache', async () => {
    const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
    const wrapper = mockedWrapperComponent({ mocks, cache });
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.items1.edges.length).toBe(1);
    });
    expect(useQueryHookResult.result.current.data?.items1.edges.length).toBe(1);
    expect(useQueryHookResult.result.current.data?.viewer.items2.edges.length).toBe(2);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

    const link = new MockSubscriptionLink();
    const client = new ApolloClient({ link, cache });
    const subscriptionWrapper = clientMockedWrapperComponent({ client });
    renderHook(() => useSubscription(subscriptionDocument), {
      wrapper: subscriptionWrapper,
    });
    act(() => {
      link.simulateResult({ result: { data: subscriptionMockData } }, true);
    });
    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.items1.edges.length).toBe(0);
    });
    expect(useQueryHookResult.result.current.data?.viewer.items2.edges.length).toBe(1);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      items1: {
        edges: [],
      },
      viewer: {
        items2: {
          edges: [{ node: { id: item2Id, __typename: 'Item' }, cursor: 'cursor-2' }],
        },
      },
    });
  });
});
