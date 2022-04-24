import { InMemoryCache, useQuery } from '@apollo/client';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
import { mockedWrapperComponent } from '../../../../utils/testing/mockedWrapperComponent';
import { generateConnectionId } from '../../pagination';
import { QueryDataType, queryDocument, queryMockData, testTypePolicies, userId } from './mock';
import {
  connectionIdOnlyQueryDocument,
  connectionIdOnlyQueryMockData,
  ConnectionIdOnlyQueryDataType,
} from './connectionId.mock';

describe('_connectionId', () => {
  let cache: InMemoryCache;
  beforeEach(() => {
    cache = new InMemoryCache({
      typePolicies: testTypePolicies,
    });
  });
  it('gets _connectionId of the connection of Root Query', async () => {
    const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
    const wrapper = mockedWrapperComponent({ mocks, cache });
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    const connectionId = generateConnectionId({
      parent: { id: 'ROOT_QUERY', typename: 'Query' },
      connection: { fieldName: 'items', args: {} },
      edge: { typename: 'ItemEdge' },
    });
    expect(useQueryHookResult.result.current.data?.items._connectionId).toBe(connectionId);
  });

  it('gets _connectionId of the connection of a type', async () => {
    const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
    const wrapper = mockedWrapperComponent({ mocks, cache });
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    const connectionId = generateConnectionId({
      parent: { id: userId, typename: 'User' },
      connection: { fieldName: 'items', args: { search: 'item' } },
      edge: { typename: 'ItemEdge' },
    });
    expect(useQueryHookResult.result.current.data?.viewer.myItems._connectionId).toBe(connectionId);
  });

  it('gets _connectionId of the connection with no edges etc. ', async () => {
    const mocks = [
      { request: { query: connectionIdOnlyQueryDocument }, result: { data: connectionIdOnlyQueryMockData } },
    ];
    const wrapper = mockedWrapperComponent({ mocks, cache });
    const useQueryHookResult = renderHook(
      () => useQuery<ConnectionIdOnlyQueryDataType>(connectionIdOnlyQueryDocument),
      { wrapper },
    );
    await useQueryHookResult.waitForValueToChange(() => useQueryHookResult.result.current.data);
    const connectionId1 = generateConnectionId({
      parent: { id: 'ROOT_QUERY', typename: 'Query' },
      connection: { fieldName: 'items', args: {} },
      edge: { typename: 'ItemEdge' },
    });
    const connectionId2 = generateConnectionId({
      parent: { id: userId, typename: 'User' },
      connection: { fieldName: 'items', args: {} },
      edge: { typename: 'ItemEdge' },
    });
    expect(useQueryHookResult.result.current.data?.items._connectionId).toBe(connectionId1);
    expect(useQueryHookResult.result.current.data?.viewer.items._connectionId).toBe(connectionId2);
  });
});
