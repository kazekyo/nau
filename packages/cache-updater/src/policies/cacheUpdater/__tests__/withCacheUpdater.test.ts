import { gql, InMemoryCache, useMutation, useQuery } from '@apollo/client';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { decode, encode } from 'js-base64';
import { generateConnectionId, relayPaginationFieldPolicy, withCacheUpdater } from '../..';
import { mockedWrapperComponent } from '../../../utils/testing/mockedWrapperComponent';

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

describe('withCacheUpdater', () => {
  it('uses a cacheIdGenerator', async () => {
    const myCacheIdGenerator = (globalId: string): string => {
      const globalIdStr = decode(globalId);
      const [typename] = globalIdStr.split('/');
      return `${typename}:${globalId}`;
    };
    const cache = new InMemoryCache({
      typePolicies: withCacheUpdater({
        cacheIdGenerator: myCacheIdGenerator,
        directiveAvailableTypes: ['Bar'],
        typePolicies: {
          Foo: {
            fields: {
              bars: relayPaginationFieldPolicy(),
            },
          },
        },
      }),
    });
    const myBackendIdGenerator = ({ typename, localId }: { typename: string; localId: string }): string =>
      encode(`${typename}/${localId}`);

    const queryDocument = gql`
      query Query {
        foo {
          id
          bars {
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
    const fooId = myBackendIdGenerator({ typename: 'Foo', localId: '1' });
    const bar1Id = myBackendIdGenerator({ typename: 'Bar', localId: '1' });
    const connectionId = generateConnectionId({ id: fooId, field: 'bars' });
    const queryMockData = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      },
    };
    const mutationDocument = gql`
      mutation AddBarMutation($connections: [String!]!, $edgeTypeName: String!) {
        addBar {
          bar @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
            id
          }
        }
      }
    `;
    const bar2Id = myBackendIdGenerator({ typename: 'Bar', localId: '2' });
    const mutationMockData = { addBar: { bar: { id: bar2Id, __typename: 'Bar' } } };
    const mutationVariables = { connections: [connectionId], edgeTypeName: 'BarEdge' };
    const mocks = [
      { request: { query: queryDocument }, result: { data: queryMockData } },
      { request: { query: mutationDocument, variables: mutationVariables }, result: { data: mutationMockData } },
    ];

    const wrapper = mockedWrapperComponent({ mocks, cache });

    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

    const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
    act(() => {
      const [addBar] = useMutationHookResult.result.current;
      void addBar({ variables: mutationVariables });
    });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    expect(useQueryHookResult.result.current.data).toMatchObject({
      foo: {
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' } }, { node: { id: bar2Id, __typename: 'Bar' } }],
        },
      },
    });
  });
});
