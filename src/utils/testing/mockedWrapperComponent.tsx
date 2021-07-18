import { ApolloCache, ApolloClient, ApolloProvider } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import * as React from 'react';

export const mockedWrapperComponent = ({
  mocks,
  cache,
}: {
  mocks: MockedResponse[];
  cache: ApolloCache<Record<string, unknown>>;
}): React.FC<{ children: React.ReactChild }> => {
  return ({ children }: { children: React.ReactChild }) => (
    <MockedProvider mocks={mocks} cache={cache}>
      {children}
    </MockedProvider>
  );
};

export const clientMockedWrapperComponent = ({
  client,
}: {
  client: ApolloClient<any>;
}): React.FC<{ children: React.ReactChild }> => {
  return ({ children }: { children: React.ReactChild }) => <ApolloProvider client={client}>{children}</ApolloProvider>;
};
