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

    it('appends the mutation result to the connection in ROOT_QUERY', async () => {
      const queryDocument = gql`
        query Query {
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
      `;
      const queryMockData = {
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' }, cursor: 'cursor-1' }],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      };
      const connectionId = generateConnectionId({ field: 'bars' });
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

      const useQueryHookResult = renderHook(() => useQuery(queryDocument), { wrapper });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data).toMatchObject(queryMockData);

      const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
      act(() => {
        const [addBar] = useMutationHookResult.result.current;
        void addBar({ variables: mutationVariables });
      });
      await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
      expect(useQueryHookResult.result.current.data).toMatchObject({
        bars: {
          edges: [{ node: { id: bar1Id, __typename: 'Bar' } }, { node: { id: bar2Id, __typename: 'Bar' } }],
        },
      });
    });

    it('appends the mutation result to each connection', async () => {
      cache = new InMemoryCache({
        typePolicies: withCacheUpdater({
          directiveAvailableTypes: ['Bar'],
          typePolicies: {
            Foo: {
              fields: {
                bars: relayPaginationFieldPolicy(['search']),
              },
            },
          },
        }),
      });

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
      const mutationDocument = gql`
        mutation AddBarMutation($connections: [String!]!, $edgeTypeName: String!, $input: AddBarInput!) {
          addBar(input: $input) {
            bar @appendNode(connections: $connections, edgeTypeName: $edgeTypeName) {
              id
            }
          }
        }
      `;

      const barId_a_1 = backendIdGenerator({ typename: 'Bar', localId: 'a-1' });
      const queryResult_a = {
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
      const connectionId_a = generateConnectionId({ id: fooId, field: 'bars', args: { search: 'a' } });
      const mutationResult_a = { addBar: { bar: { id: barId_a_2, __typename: 'Bar' } } };
      const mutationVariables_a = { connections: [connectionId_a], edgeTypeName: 'BarEdge', input: { text: 'a' } };

      const barId_b_1 = backendIdGenerator({ typename: 'Bar', localId: 'b-1' });
      const queryResult_b = {
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
      const connectionId_b = generateConnectionId({ id: fooId, field: 'bars', args: { search: 'b' } });
      const mutationResult_b = { addBar: { bar: { id: barId_b_2, __typename: 'Bar' } } };
      const mutationVariables_b = { connections: [connectionId_b], edgeTypeName: 'BarEdge', input: { text: 'b' } };

      const mocks = [
        { request: { query: queryDocument, variables: { text: 'a' } }, result: { data: queryResult_a } },
        {
          request: { query: mutationDocument, variables: mutationVariables_a },
          result: { data: mutationResult_a },
        },
        { request: { query: queryDocument, variables: { text: 'b' } }, result: { data: queryResult_b } },
        {
          request: { query: mutationDocument, variables: mutationVariables_b },
          result: { data: mutationResult_b },
        },
      ];

      const wrapper = mockedWrapperComponent({ mocks, cache });

      const useQueryHookResult_a = renderHook(
        () => useQuery<QueryDataType>(queryDocument, { variables: { text: 'a' } }),
        { wrapper },
      );
      await useQueryHookResult_a.waitForValueToChange(() => useQueryHookResult_a.result.current.data);
      expect(useQueryHookResult_a.result.current.data).toMatchObject(queryResult_a);

      const useQueryHookResult_b = renderHook(
        () => useQuery<QueryDataType>(queryDocument, { variables: { text: 'b' } }),
        { wrapper },
      );
      await useQueryHookResult_b.waitForValueToChange(() => useQueryHookResult_b.result.current.data);
      expect(useQueryHookResult_b.result.current.data).toMatchObject(queryResult_b);

      const useMutationHookResult = renderHook(() => useMutation(mutationDocument), { wrapper });
      act(() => {
        const [addBar] = useMutationHookResult.result.current;
        void addBar({ variables: mutationVariables_a });
        void addBar({ variables: mutationVariables_b });
      });
      await useQueryHookResult_b.waitForValueToChange(() => useQueryHookResult_b.result.current.data);

      expect(useQueryHookResult_a.result.current.data).toMatchObject({
        foo: {
          bars: {
            edges: [{ node: { id: barId_a_1, __typename: 'Bar' } }, { node: { id: barId_a_2, __typename: 'Bar' } }],
          },
        },
      });
      expect(useQueryHookResult_b.result.current.data).toMatchObject({
        foo: {
          bars: {
            edges: [{ node: { id: barId_b_1, __typename: 'Bar' } }, { node: { id: barId_b_2, __typename: 'Bar' } }],
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
