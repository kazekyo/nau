import { gql, InMemoryCache, useQuery, FieldPolicy } from '@apollo/client';
import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react-hooks';
import { relayPaginationFieldPolicy, withCacheUpdater } from '../..';
import { backendIdGenerator } from '../../utils/testing/backendIdGenerator';
import { mockedWrapperComponent } from '../../utils/testing/mockedWrapperComponent';

type QueryDataType = {
  foo: {
    id: string;
    __typename: 'Foo';
    bars: {
      edges: { node: { id: string; __typename: 'Bar' }; cursor: string }[];
      pageInfo: { hasNextPage?: boolean; hasPreviousPage?: boolean; endCursor?: string; startCursor?: string };
    };
  };
};

const createInmemoryCache = ({ relayFieldPolicy }: { relayFieldPolicy: FieldPolicy }) => {
  return new InMemoryCache({
    typePolicies: withCacheUpdater({
      directiveAvailableTypes: ['Bar'],
      typePolicies: {
        Foo: {
          fields: {
            bars: relayFieldPolicy,
          },
        },
      },
    }),
  });
};

describe('relayPaginationFieldPolicy', () => {
  it('merges next page items', async () => {
    const queryDocument = gql`
      query Query($cursor: String) {
        foo {
          id
          bars(first: 1, after: $cursor) {
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
      }
    `;
    const fooId = backendIdGenerator({ typename: 'Foo', localId: '1' });
    const bar1Id = backendIdGenerator({ typename: 'Bar', localId: '1' });
    const result1 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      },
    };
    const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
    const result2 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar2Id, __typename: 'Bar' }, cursor: 'cursor-2' }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      },
    };
    const mocks = [
      { request: { query: queryDocument }, result: { data: result1 } },
      { request: { query: queryDocument, variables: { cursor: 'cursor-1' } }, result: { data: result2 } },
    ];

    const cache = createInmemoryCache({ relayFieldPolicy: relayPaginationFieldPolicy() });
    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(result1);

    act(() => {
      const { fetchMore, data } = useQueryHookResult.result.current;
      void fetchMore({ variables: { cursor: data?.foo.bars.pageInfo.endCursor } });
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      foo: {
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' } }, { node: { id: bar2Id, __typename: 'Bar' } }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      },
    });
  });

  it('merges previous page items', async () => {
    const queryDocument = gql`
      query Query($cursor: String) {
        foo {
          id
          bars(last: 1, before: $cursor) {
            edges {
              node {
                id
              }
              cursor
            }
            pageInfo {
              hasPreviousPage
              startCursor
            }
          }
        }
      }
    `;
    const fooId = backendIdGenerator({ typename: 'Foo', localId: '1' });
    const bar1Id = backendIdGenerator({ typename: 'Bar', localId: '1' });
    const result1 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' }],
          pageInfo: { hasPreviousPage: true, startCursor: 'cursor-1' },
        },
      },
    };
    const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
    const result2 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar2Id, __typename: 'Bar' }, cursor: 'cursor-2' }],
          pageInfo: { hasPreviousPage: false, startCursor: 'cursor-2' },
        },
      },
    };
    const mocks = [
      { request: { query: queryDocument }, result: { data: result1 } },
      { request: { query: queryDocument, variables: { cursor: 'cursor-1' } }, result: { data: result2 } },
    ];

    const cache = createInmemoryCache({ relayFieldPolicy: relayPaginationFieldPolicy() });
    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(result1);

    act(() => {
      const { fetchMore, data } = useQueryHookResult.result.current;
      void fetchMore({ variables: { cursor: data?.foo.bars.pageInfo.startCursor } });
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      foo: {
        bars: {
          edges: [{ node: { id: bar2Id, __typename: 'Bar' } }, { node: { id: bar1Id, __typename: 'Bar' } }],
          pageInfo: { hasPreviousPage: false, startCursor: 'cursor-2' },
        },
      },
    });
  });

  it('merges page items using keyArgs into each list', async () => {
    const queryDocument = gql`
      query Query($cursor: String, $text: String) {
        foo {
          id
          bars(first: 1, after: $cursor, search: $text) {
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
      }
    `;
    const fooId = backendIdGenerator({ typename: 'Foo', localId: '1' });

    const barId_a_1 = backendIdGenerator({ typename: 'Bar', localId: 'a-1' });
    const result_a_1 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: barId_a_1, __typename: 'Bar' }, cursor: 'cursor-a-1' }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-a-1' },
        },
      },
    };
    const barId_a_2 = backendIdGenerator({ typename: 'Bar', localId: 'a-2' });
    const result_a_2 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: barId_a_2, __typename: 'Bar' }, cursor: 'cursor-a-2' }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-a-2' },
        },
      },
    };

    const barId_b_1 = backendIdGenerator({ typename: 'Bar', localId: 'b-1' });
    const result_b_1 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: barId_b_1, __typename: 'Bar' }, cursor: 'cursor-b-1' }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-b-1' },
        },
      },
    };
    const barId_b_2 = backendIdGenerator({ typename: 'Bar', localId: 'b-2' });
    const result_b_2 = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: barId_b_2, __typename: 'Bar' }, cursor: 'cursor-b-2' }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-b-2' },
        },
      },
    };

    const mocks = [
      { request: { query: queryDocument, variables: { text: 'a' } }, result: { data: result_a_1 } },
      {
        request: { query: queryDocument, variables: { cursor: 'cursor-a-1', text: 'a' } },
        result: { data: result_a_2 },
      },
      { request: { query: queryDocument, variables: { text: 'b' } }, result: { data: result_b_1 } },
      {
        request: { query: queryDocument, variables: { cursor: 'cursor-b-1', text: 'b' } },
        result: { data: result_b_2 },
      },
    ];

    const cache = createInmemoryCache({ relayFieldPolicy: relayPaginationFieldPolicy(['search']) });
    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult_a = renderHook(
      () => useQuery<QueryDataType>(queryDocument, { variables: { text: 'a' } }),
      { wrapper },
    );
    await useQueryHookResult_a.waitForValueToChange(() => useQueryHookResult_a.result.current.data);
    expect(useQueryHookResult_a.result.current.data).toMatchObject(result_a_1);

    const useQueryHookResult_b = renderHook(
      () => useQuery<QueryDataType>(queryDocument, { variables: { text: 'b' } }),
      { wrapper },
    );
    await useQueryHookResult_b.waitForValueToChange(() => useQueryHookResult_b.result.current.data);
    expect(useQueryHookResult_b.result.current.data).toMatchObject(result_b_1);

    act(() => {
      const { fetchMore: fetchMore_a, data: data_a } = useQueryHookResult_a.result.current;
      void fetchMore_a({ variables: { cursor: data_a?.foo.bars.pageInfo.endCursor, text: 'a' } });

      const { fetchMore: fetchMore_b, data: data_b } = useQueryHookResult_b.result.current;
      void fetchMore_b({ variables: { cursor: data_b?.foo.bars.pageInfo.endCursor, text: 'b' } });
    });
    await useQueryHookResult_b.waitForValueToChange(() => useQueryHookResult_b.result.current.data);

    expect(useQueryHookResult_a.result.current.data).toMatchObject({
      foo: {
        bars: {
          edges: [{ node: { id: barId_a_1, __typename: 'Bar' } }, { node: { id: barId_a_2, __typename: 'Bar' } }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-a-2' },
        },
      },
    });
    expect(useQueryHookResult_b.result.current.data).toMatchObject({
      foo: {
        bars: {
          edges: [{ node: { id: barId_b_1, __typename: 'Bar' } }, { node: { id: barId_b_2, __typename: 'Bar' } }],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-b-2' },
        },
      },
    });
  });
});
