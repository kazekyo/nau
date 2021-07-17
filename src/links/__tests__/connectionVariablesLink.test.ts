import { ApolloLink, disableFragmentWarnings, execute, from, gql, Observable } from '@apollo/client';
import { print } from 'graphql/language';
import { createArgumentDefinitionsLink } from '../argumentDefinitionsLink';
import { createConnectionLink } from '../connectionLink';
import { createConnectionVariablesLink } from '../connectionVariablesLink';
import { ContextType } from '../utils';

disableFragmentWarnings();

jest.mock('nanoid', () => {
  return {
    customAlphabet: () => () => 'random',
  };
});

describe('connectionVariablesLink', () => {
  it('changes the query and variables with connectionLink and argumentDefinitionsLink', (done) => {
    const document = gql`
      query TestQuery($fetchCount: Int!) {
        foo {
          ...bar @arguments(count: $fetchCount)
        }
      }
      fragment bar on Bar @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        baz(first: $count, after: $cursor) @paginatable {
          id
        }
      }
    `;

    const expectedDocument = gql`
      query TestQuery($fetchCount: Int!, $cursor: String!) {
        foo {
          ...bar_random
        }
      }
      fragment bar_random on Bar {
        baz(first: $fetchCount, after: $cursor) {
          id
        }
      }
    `;
    const expectedVariables = { fetchCount: 2, cursor: 'dummy' };
    const successMockData = { data: { success: 'ok' } };
    const mockLink = new ApolloLink((operation) => {
      expect(print(operation.query)).toBe(print(expectedDocument));
      expect(operation.variables).toMatchObject(expectedVariables);
      return Observable.of(successMockData);
    });
    const link = from([
      createConnectionLink(),
      createArgumentDefinitionsLink(),
      createConnectionVariablesLink(),
      mockLink,
    ]);
    const context: ContextType = {
      nau: { refetch: { fragmentName: 'bar_random' }, connection: { variables: { count: 2, cursor: 'dummy' } } },
    };
    execute(link, { query: document, context }).subscribe((result) => {
      expect(result).toBe(successMockData);
      done();
    });
  });
});
