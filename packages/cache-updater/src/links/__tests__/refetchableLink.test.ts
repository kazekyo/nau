import { ApolloLink, disableFragmentWarnings, execute, from, gql, Observable } from '@apollo/client';
import { print } from 'graphql/language';
import { createRefetchableLink } from '../refetchableLink';
import { ContextType } from '../utils';

disableFragmentWarnings();

jest.mock('nanoid', () => {
  return {
    customAlphabet: () => () => 'random',
  };
});

describe('refetchableLink', () => {
  const subjectLink = createRefetchableLink();
  it('replaces the query name', (done) => {
    const expectedQueryName = 'NewQueryName';
    const document = gql`
      query TestQuery {
        foo {
          ...bar
        }
      }
      fragment bar on Bar @refetchable(queryName: "${expectedQueryName}") {
        id
      }
    `;
    const expectedDocument = gql`
      query ${expectedQueryName} {
        foo {
          ...bar
        }
      }
      fragment bar on Bar {
        id
      }
    `;

    const successMockData = { data: { success: 'ok' } };
    const mockLink = new ApolloLink((operation) => {
      expect(print(operation.query)).toBe(print(expectedDocument));
      expect(operation.operationName).toBe(expectedQueryName);
      return Observable.of(successMockData);
    });
    const link = from([subjectLink, mockLink]);
    const context: ContextType = { nau: { refetch: { fragmentName: 'bar' } } };
    execute(link, { query: document, context }).subscribe((result) => {
      expect(result).toBe(successMockData);
      done();
    });
  });
});
