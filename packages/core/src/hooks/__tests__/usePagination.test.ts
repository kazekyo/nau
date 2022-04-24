import { InMemoryCache, useQuery } from '@apollo/client';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { mockedWrapperComponent } from '../../utils/testing/mockedWrapperComponent';
import { usePagination } from '../usePagination';
import {
  queryWithKeywordDocument,
  queryWithKeywordMockData,
  paginationQueryWithKeywordDocument,
  paginationQueryWithKeywordMockData,
} from './usePagination.mock';
import {
  backwardPaginationQueryDocument,
  backwardPaginationQueryMockData,
  backwardQueryDocument,
  backwardQueryMockData,
  forwardPaginationQueryDocument,
  forwardPaginationQueryMockData,
  forwardQueryDocument,
  forwardQueryMockData,
  item1Id,
  item2Id,
  item3Id,
  QueryDataType,
  testTypePolicies,
  userId,
} from './usePagination.mock';

describe('usePagination', () => {
  let cache: InMemoryCache;
  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: testTypePolicies,
    });
  });

  it('returns page data in the forward direction', async () => {
    const mocks = [
      {
        request: { query: forwardQueryDocument },
        result: { data: forwardQueryMockData },
      },
      {
        request: { query: forwardPaginationQueryDocument, variables: { id: userId, count: 2, cursor: 'cursor-1' } },
        result: { data: forwardPaginationQueryMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(forwardQueryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(forwardQueryMockData);

    const usePaginationHookResult = renderHook(
      () =>
        usePagination(
          forwardPaginationQueryDocument,
          useQueryHookResult.result.current.data
            ? {
                id: useQueryHookResult.result.current.data.viewer.id,
                connection: useQueryHookResult.result.current.data.viewer.items,
              }
            : undefined,
        ),
      { wrapper },
    );

    expect(usePaginationHookResult.result.current).toMatchObject({ hasNext: true, isLoading: false });
    expect(usePaginationHookResult.result.current.nodes).toStrictEqual([{ id: item1Id, __typename: 'Item' }]);

    act(() => {
      const { loadNext } = usePaginationHookResult.result.current;
      if (!loadNext) return;
      loadNext(2);
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    usePaginationHookResult.rerender();

    expect(usePaginationHookResult.result.current).toMatchObject({ hasNext: false, isLoading: false });
    expect(usePaginationHookResult.result.current.nodes).toStrictEqual([
      { id: item1Id, __typename: 'Item' },
      { id: item2Id, __typename: 'Item' },
      { id: item3Id, __typename: 'Item' },
    ]);
  });

  it('returns page data in the backward direction', async () => {
    const mocks = [
      {
        request: { query: backwardQueryDocument },
        result: { data: backwardQueryMockData },
      },
      {
        request: {
          query: backwardPaginationQueryDocument,
          variables: { id: userId, count: 2, cursor: 'cursor-3' },
        },
        result: { data: backwardPaginationQueryMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(backwardQueryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(backwardQueryMockData);

    const usePaginationHookResult = renderHook(
      () =>
        usePagination(
          backwardPaginationQueryDocument,
          useQueryHookResult.result.current.data
            ? {
                id: useQueryHookResult.result.current.data.viewer.id,
                connection: useQueryHookResult.result.current.data.viewer.items,
              }
            : undefined,
        ),
      { wrapper },
    );

    expect(usePaginationHookResult.result.current).toMatchObject({ hasPrevious: true, isLoading: false });
    expect(usePaginationHookResult.result.current.nodes).toStrictEqual([{ id: item3Id, __typename: 'Item' }]);

    act(() => {
      const { loadPrevious } = usePaginationHookResult.result.current;
      if (!loadPrevious) return;
      loadPrevious(2);
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    usePaginationHookResult.rerender();

    expect(usePaginationHookResult.result.current).toMatchObject({ hasPrevious: false, isLoading: false });
    expect(usePaginationHookResult.result.current.nodes).toStrictEqual([
      { id: item1Id, __typename: 'Item' },
      { id: item2Id, __typename: 'Item' },
      { id: item3Id, __typename: 'Item' },
    ]);
  });

  it('runs with variables', async () => {
    const mocks = [
      {
        request: { query: queryWithKeywordDocument, variables: { keyword: 'test' } },
        result: { data: queryWithKeywordMockData },
      },
      {
        request: {
          query: paginationQueryWithKeywordDocument,
          variables: { id: userId, count: 2, cursor: 'cursor-1', keyword: 'test' },
        },
        result: { data: paginationQueryWithKeywordMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(
      () => useQuery<QueryDataType>(queryWithKeywordDocument, { variables: { keyword: 'test' } }),
      { wrapper },
    );
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryWithKeywordMockData);

    const usePaginationHookResult = renderHook(
      () =>
        usePagination(
          paginationQueryWithKeywordDocument,
          useQueryHookResult.result.current.data
            ? {
                id: useQueryHookResult.result.current.data.viewer.id,
                connection: useQueryHookResult.result.current.data.viewer.items,
                variables: { keyword: 'test' },
              }
            : undefined,
        ),
      { wrapper },
    );

    expect(usePaginationHookResult.result.current).toMatchObject({ hasNext: true, isLoading: false });
    expect(usePaginationHookResult.result.current.nodes).toStrictEqual([{ id: item1Id, __typename: 'Item' }]);

    act(() => {
      const { loadNext } = usePaginationHookResult.result.current;
      if (!loadNext) return;
      loadNext(2);
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    usePaginationHookResult.rerender();

    expect(usePaginationHookResult.result.current).toMatchObject({ hasNext: false, isLoading: false });
    expect(usePaginationHookResult.result.current.nodes).toStrictEqual([
      { id: item1Id, __typename: 'Item' },
      { id: item2Id, __typename: 'Item' },
      { id: item3Id, __typename: 'Item' },
    ]);
  });
});
