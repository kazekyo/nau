/* eslint-disable @typescript-eslint/no-unsafe-call */
import { gql, InMemoryCache, useQuery } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { encode } from 'js-base64';
import * as React from 'react';
import { relayPaginationFieldPolicy } from '../..';
import { usePaginationFragment } from '../usePaginationFragment';

const apiIdGenerator = ({ typename, localId }: { typename: string; localId: number }) =>
  encode(`${typename}|${localId}`);

const FOO_ID = apiIdGenerator({ typename: 'Foo', localId: 1 });

const Fragments = {
  forward: gql`
    fragment ForwardPaginationFragment on Foo
    @argumentDefinitions(count: { type: "Int", defaultValue: 2 }, cursor: { type: "String" })
    @refetchable(queryName: "PaginationQuery") {
      id
      bars(first: $count, after: $cursor) @nauConnection {
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
  `,
};

const QUERY = gql`
  query Query {
    foo {
      id
      ...ForwardPaginationFragment
    }
  }
  ${Fragments.forward}
`;

const PAGINATION_QUERY = gql`
  query TemporaryPaginationQuery($id: ID!) {
    node(id: $id) {
      ...ForwardPaginationFragment
    }
  }
  ${Fragments.forward}
`;

type FragmentDataType = {
  id: string;
  __typename: 'Foo';
  bars: {
    edges: { node: { id: string; __typename: 'Bar' }; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
};

type QueryDataType = {
  foo: FragmentDataType;
};

type PaginationQueryDataType = {
  node: FragmentDataType;
};

describe('usePaginationFragment', () => {
  it('fetches the data', async () => {
    const bar1Id = apiIdGenerator({ typename: 'Bar', localId: 1 });
    const firstQueryMockData: QueryDataType = {
      foo: {
        id: FOO_ID,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      },
    };

    const bar2Id = apiIdGenerator({ typename: 'Bar', localId: 2 });
    const paginationQueryMockData: PaginationQueryDataType = {
      node: {
        id: FOO_ID,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar2Id, __typename: 'Bar' }, cursor: 'cursor-2' }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      },
    };
    const mocks = [
      {
        request: { query: QUERY },
        result: { data: firstQueryMockData },
      },
      {
        request: { query: PAGINATION_QUERY, variables: { id: FOO_ID } },
        result: { data: paginationQueryMockData },
      },
    ];

    const cache = new InMemoryCache({
      typePolicies: {
        Foo: {
          fields: {
            bars: relayPaginationFieldPolicy(),
          },
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactChild }) => (
      <MockedProvider mocks={mocks} cache={cache}>
        {children}
      </MockedProvider>
    );

    // step1: First fetch
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(QUERY), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(firstQueryMockData);
    const usePaginationFragmentHookResult = renderHook(
      () =>
        usePaginationFragment<FragmentDataType>({
          id: FOO_ID,
          fragment: Fragments.forward,
          fragmentName: 'ForwardPaginationFragment',
        }),
      { wrapper },
    );
    expect(usePaginationFragmentHookResult.result.current).toMatchObject({
      data: firstQueryMockData.foo,
      hasNext: true,
      hasPrevious: false,
      isLoadingNext: false,
      isLoadingPrevious: false,
    });

    // Step2: Load next page
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
            { node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' },
            { node: { id: bar2Id, __typename: 'Bar' }, cursor: 'cursor-2' },
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
