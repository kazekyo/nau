/* eslint-disable @typescript-eslint/no-unsafe-call */
import { InMemoryCache, useQuery } from '@apollo/client';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { relayPaginationFieldPolicy } from '../..';
import { mockedWrapperComponent } from '../../utils/testing/mockedWrapperComponent';
import { usePaginationFragment } from '../usePaginationFragment';
import {
  backwardPaginationQueryMockData,
  backwardQueryMockData,
  BACKWARD_PAGINATION_FRAGMENT,
  BACKWARD_PAGINATION_QUERY,
  BACKWARD_QUERY,
  BAR_1_ID,
  BAR_2_ID,
  FOO_ID,
  forwardPaginationQueryMockData,
  forwardQueryMockData,
  FORWARD_PAGINATION_FRAGMENT,
  FORWARD_PAGINATION_QUERY,
  FORWARD_QUERY,
  FragmentDataType,
  QueryDataType,
} from './mockData';

describe('usePaginationFragment', () => {
  let cache: InMemoryCache;
  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: {
        Foo: {
          fields: {
            bars: relayPaginationFieldPolicy(),
          },
        },
      },
    });
  });

  it('returns page data in the forward direction', async () => {
    const mocks = [
      {
        request: { query: FORWARD_QUERY },
        result: { data: forwardQueryMockData },
      },
      {
        request: { query: FORWARD_PAGINATION_QUERY, variables: { id: FOO_ID } },
        result: { data: forwardPaginationQueryMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    // step1: First fetch
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(FORWARD_QUERY), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(forwardQueryMockData);
    const usePaginationFragmentHookResult = renderHook(
      () =>
        usePaginationFragment<FragmentDataType>({
          id: FOO_ID,
          fragment: FORWARD_PAGINATION_FRAGMENT,
          fragmentName: 'ForwardPaginationFragment',
        }),
      { wrapper },
    );
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({
      data: forwardQueryMockData.foo,
      hasNext: true,
      hasPrevious: false,
      isLoadingNext: false,
      isLoadingPrevious: false,
    });

    // Step2: Load more
    act(() => {
      usePaginationFragmentHookResult.result.current.loadNext(1);
    });
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({ isLoadingNext: true });
    await usePaginationFragmentHookResult.waitForValueToChange(
      () => usePaginationFragmentHookResult.result.current.data,
    );
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({
      data: {
        bars: {
          edges: [
            { node: { id: BAR_1_ID, __typename: 'Bar' }, cursor: 'cursor-1' },
            { node: { id: BAR_2_ID, __typename: 'Bar' }, cursor: 'cursor-2' },
          ],
        },
      },
      hasNext: false,
      hasPrevious: false,
      isLoadingNext: false,
      isLoadingPrevious: false,
    });
  });

  it('returns page data in the backward direction', async () => {
    const mocks = [
      {
        request: { query: BACKWARD_QUERY },
        result: { data: backwardQueryMockData },
      },
      {
        request: { query: BACKWARD_PAGINATION_QUERY, variables: { id: FOO_ID } },
        result: { data: backwardPaginationQueryMockData },
      },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    // step1: First fetch
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(BACKWARD_QUERY), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(backwardQueryMockData);
    const usePaginationFragmentHookResult = renderHook(
      () =>
        usePaginationFragment<FragmentDataType>({
          id: FOO_ID,
          fragment: BACKWARD_PAGINATION_FRAGMENT,
          fragmentName: 'BackwardPaginationFragment',
        }),
      { wrapper },
    );
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({
      data: backwardQueryMockData.foo,
      hasNext: false,
      hasPrevious: true,
      isLoadingNext: false,
      isLoadingPrevious: false,
    });

    // Step2: Load more
    act(() => {
      usePaginationFragmentHookResult.result.current.loadPrevious(1);
    });
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({ isLoadingPrevious: true });
    await usePaginationFragmentHookResult.waitForValueToChange(
      () => usePaginationFragmentHookResult.result.current.data,
    );
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({
      data: {
        bars: {
          edges: [
            { node: { id: BAR_1_ID, __typename: 'Bar' }, cursor: 'cursor-1' },
            { node: { id: BAR_2_ID, __typename: 'Bar' }, cursor: 'cursor-2' },
          ],
        },
      },
      hasNext: false,
      hasPrevious: false,
      isLoadingNext: false,
      isLoadingPrevious: false,
    });
  });
});
