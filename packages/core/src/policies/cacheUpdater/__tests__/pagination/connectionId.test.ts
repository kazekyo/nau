import { InMemoryCache, useQuery } from '@apollo/client';
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { mockedWrapperComponent } from '../../../../utils/testing/mockedWrapperComponent';
import { generateConnectionId } from '../../pagination';
import {
  ConnectionIdOnlyQueryDataType,
  connectionIdOnlyQueryDocument,
  connectionIdOnlyQueryMockData,
} from './connectionId.mock';
import { QueryDataType, queryDocument, queryMockData, testTypePolicies, userId } from './mock';

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
    const connectionId = generateConnectionId({
      parent: { id: 'ROOT_QUERY', typename: 'Query' },
      connection: { fieldName: 'items', args: {} },
      edge: { typename: 'ItemEdge' },
    });
    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.items._connectionId).toBe(connectionId);
    });
  });

  it('gets _connectionId of the connection of a type', async () => {
    const mocks = [{ request: { query: queryDocument }, result: { data: queryMockData } }];
    const wrapper = mockedWrapperComponent({ mocks, cache });
    const useQueryHookResult = renderHook(() => useQuery<QueryDataType>(queryDocument), { wrapper });
    const connectionId = generateConnectionId({
      parent: { id: userId, typename: 'User' },
      connection: { fieldName: 'items', args: { search: 'item' } },
      edge: { typename: 'ItemEdge' },
    });
    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.viewer.myItems._connectionId).toBe(connectionId);
    });
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
    await waitFor(() => {
      expect(useQueryHookResult.result.current.data?.items._connectionId).toBe(connectionId1);
    });
    expect(useQueryHookResult.result.current.data?.items._connectionId).toBe(connectionId1);
    expect(useQueryHookResult.result.current.data?.viewer.items._connectionId).toBe(connectionId2);
  });
});
