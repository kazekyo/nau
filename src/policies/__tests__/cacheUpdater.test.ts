import { ApolloClient, gql, InMemoryCache, useMutation, useQuery, useSubscription } from '@apollo/client';
import { MockSubscriptionLink } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { generateConnectionId, relayPaginationFieldPolicy, withCacheUpdater } from '../..';
import { backendIdGenerator } from '../../utils/testing/backendIdGenerator';
import { clientMockedWrapperComponent, mockedWrapperComponent } from '../../utils/testing/mockedWrapperComponent';

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

describe('cacheUpdater', () => {
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
  const fooId = backendIdGenerator({ typename: 'Foo', localId: '1' });
  const bar1Id = backendIdGenerator({ typename: 'Bar', localId: '1' });
  const connectionId = generateConnectionId({ id: fooId, field: 'bars' });
  let cache: InMemoryCache;
  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: withCacheUpdater({
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
  });

  describe('@appendNode', () => {
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

    it('appends the mutation result to the connection', async () => {
      const mutationDocument = gql`
        mutation AddBarMutation($connections: [String!]!, $edgeTypeName: String!) {
          addBar {
            bar @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
              id
            }
          }
        }
      `;
      const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
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

    it('appends the subscription result to the connection', async () => {
      const subscriptionDocument = gql`
        subscription BarAddedSubscription($connections: [String!]!, $edgeTypeName: String!) {
          barAdded {
            bar @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
              id
            }
          }
        }
      `;
      const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
      const wrapper = mockedWrapperComponent({ mocks, cache });
      const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

      const link = new MockSubscriptionLink();
      const client = new ApolloClient({ link, cache });
      const subscriptionWrapper = clientMockedWrapperComponent({ client });
      const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
      const subscriptionMockData = { barAdded: { bar: { id: bar2Id, __typename: 'Bar' } } };
      const useSubscriptionHookResult = renderHook(
        () =>
          useSubscription(subscriptionDocument, {
            variables: { connections: [connectionId], edgeTypeName: 'BarEdge' },
          }),
        { wrapper: subscriptionWrapper },
      );
      act(() => {
        link.simulateResult({ result: { data: subscriptionMockData } }, true);
      });
      await useSubscriptionHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);

      expect(useQueryHookResult.result.current.data).toMatchObject({
        foo: {
          bars: {
            edges: [{ node: { id: bar1Id, __typename: 'Bar' } }, { node: { id: bar2Id, __typename: 'Bar' } }],
          },
        },
      });
    });
  });

  describe('@prependNode', () => {
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

    it('prepends the mutation result to the connection', async () => {
      const mutationDocument = gql`
        mutation AddBarMutation($connections: [String!]!, $edgeTypeName: String!) {
          addBar {
            bar @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
              id
            }
          }
        }
      `;
      const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
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
            edges: [{ node: { id: bar2Id, __typename: 'Bar' } }, { node: { id: bar1Id, __typename: 'Bar' } }],
          },
        },
      });
    });

    it('prepends the subscription result to the connection', async () => {
      const subscriptionDocument = gql`
        subscription BarAddedSubscription($connections: [String!]!, $edgeTypeName: String!) {
          barAdded {
            bar @prependNode(connections: $connections, edgeTypeName: $edgeTypeName) {
              id
            }
          }
        }
      `;
      const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
      const wrapper = mockedWrapperComponent({ mocks, cache });
      const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

      const link = new MockSubscriptionLink();
      const client = new ApolloClient({ link, cache });
      const subscriptionWrapper = clientMockedWrapperComponent({ client });
      const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
      const subscriptionMockData = { barAdded: { bar: { id: bar2Id, __typename: 'Bar' } } };
      const useSubscriptionHookResult = renderHook(
        () =>
          useSubscription(subscriptionDocument, {
            variables: { connections: [connectionId], edgeTypeName: 'BarEdge' },
          }),
        { wrapper: subscriptionWrapper },
      );
      act(() => {
        link.simulateResult({ result: { data: subscriptionMockData } }, true);
      });
      await useSubscriptionHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);

      expect(useQueryHookResult.result.current.data).toMatchObject({
        foo: {
          bars: {
            edges: [{ node: { id: bar2Id, __typename: 'Bar' } }, { node: { id: bar1Id, __typename: 'Bar' } }],
          },
        },
      });
    });
  });

  describe('@deleteRecord', () => {
    const bar2Id = backendIdGenerator({ typename: 'Bar', localId: '2' });
    const queryMockData = {
      foo: {
        id: fooId,
        __typename: 'Foo',
        bars: {
          edges: [
            { node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' },
            { node: { id: bar2Id, __typename: 'Bar' }, cursor: 'cursor-2' },
          ],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      },
    };

    it('deletes the mutation result from the cache', async () => {
      const mutationDocument = gql`
        mutation DeleteBarMutation {
          removeBar {
            bar {
              id @deleteRecord
            }
          }
        }
      `;

      const mutationMockData = { removeBar: { bar: { id: bar2Id, __typename: 'Bar' } } };
      const mocks = [
        { request: { query: queryDocument }, result: { data: queryMockData } },
        { request: { query: mutationDocument }, result: { data: mutationMockData } },
      ];

      const wrapper = mockedWrapperComponent({ mocks, cache });

      const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data?.foo.bars.edges.length).toBe(2);
      expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

      const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
      act(() => {
        const [removeBar] = useMutationHookResult.result.current;
        void removeBar();
      });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data?.foo.bars.edges.length).toBe(1);
      expect(useQueryHookResult.result.current.data).toMatchObject({
        foo: {
          bars: {
            edges: [{ node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' }],
          },
        },
      });
    });

    it('deletes the subscription result from the cache', async () => {
      const subscriptionDocument = gql`
        subscription BarAddedSubscription($connections: [String!]!, $edgeTypeName: String!) {
          barRemoved {
            bar {
              id @deleteRecord
            }
          }
        }
      `;
      const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
      const wrapper = mockedWrapperComponent({ mocks, cache });
      const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data?.foo.bars.edges.length).toBe(2);
      expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

      const link = new MockSubscriptionLink();
      const client = new ApolloClient({ link, cache });
      const subscriptionWrapper = clientMockedWrapperComponent({ client });
      const subscriptionMockData = { barRemoved: { bar: { id: bar2Id, __typename: 'Bar' } } };
      const useSubscriptionHookResult = renderHook(() => useSubscription(subscriptionDocument), {
        wrapper: subscriptionWrapper,
      });
      act(() => {
        link.simulateResult({ result: { data: subscriptionMockData } }, true);
      });
      await useSubscriptionHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data?.foo.bars.edges.length).toBe(1);
      expect(useQueryHookResult.result.current.data).toMatchObject({
        foo: {
          bars: {
            edges: [{ node: { id: bar1Id, __typename: 'Bar' } }],
          },
        },
      });
    });
  });
});
